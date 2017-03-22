const fs = require('fs');
const process = require('process');

const Promise = require('bluebird');
const _ = require('lodash/fp');
const commander = require('commander');
const elastic = require('elasticsearch');

commander
  .version('0.1.0')
  .option('-i, --index <index>', 'The index name.')
  .option('-m, --mappings <mappings>', 'A json file with mappings.')
  .option('-n, --new', 'Create new index without migrating.')
  .option('-u, --url [url]', 'The address of elastic search. Defaults to `localhost:9200`.')
  .option('-l, --log-level [loglevel]', 'The log level. Defaults to `error`. Set this option to' +
          '`debug` to see the queries this script performs.')
  .parse(process.argv);

if (!commander.mappings || !commander.index) {
  commander.help();
}
const mappings = JSON.parse(fs.readFileSync(commander.mappings));

const client = new elastic.Client({
  host: commander.url || 'localhost:9200',
  log: commander.logLevel || 'error',
});

(async function() {
  if (commander.new) {
    await createNew().catch(exitWithError);
  } else {
    await migrate().catch(exitWithError);
  }
  exitNormally();
})();

async function createNew() {
  const indexName = commander.index + '_v0';
  await createVersionedIndex(indexName);
  await createAlias(indexName);
}

async function migrate() {
  const aliases = await client.cat.aliases({format: 'json'});
  const relevantAlias = _.filter(['alias',  commander.index])(aliases);
  const oldVersionNumber = getLatestVersionNumber(relevantAlias);
  const newVersionNumber = oldVersionNumber + 1;
  const indexName = commander.index + '_v' + newVersionNumber;
  await removeOldAlias(relevantAlias);
  await createVersionedIndex(indexName);
  await createAlias(indexName);
  await reindex(oldVersionNumber, newVersionNumber);
}

async function reindex(oldVersionNumber, newVersionNumber) {
  const oldIndex = commander.index + '_v' + oldVersionNumber;
  const newIndex = commander.index + '_v' + newVersionNumber;
  return client.reindex({body: {
    source: {index: oldIndex},
    dest: {index: newIndex}
  }});
}

async function removeOldAlias(relevantAlias) {
  const promises = _.map(alias => {
    return client.indices.deleteAlias({
      name: alias.alias,
      index: alias.index,
    });
  })(relevantAlias);
  return Promise.all(promises);
}

async function createAlias(indexName) {
  return client.indices.putAlias({
    index: indexName,
    name: commander.index,
  });
}

async function createVersionedIndex(indexName) {
  return client.indices.create({
    method: 'put',
    index: indexName,
    body: mappings,
  });
}

const getLatestVersionNumber = _.flow([
  _.map('index'),
  _.map(getVersionNumber),
  _.sortBy(_.identity),
  _.reverse,
  _.first,
]);

function getVersionNumber(index) {
  const version = Number(index.split('_v')[1]);
  return !_.isFinite(version) ? -1 : version;
}

function exitNormally() {
  console.log('Migration done.');
  process.exit(0);
}

function exitWithError(error) {
  console.error(error);
  process.exit(1);
}
