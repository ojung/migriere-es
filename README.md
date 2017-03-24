# Elastic search migrations

Mappings in elasticsearch can basicly be seen as a kind of schema of your database.
Since the mappings can be subject to change and the process to reindex data can be
cumbersome I wrote this script which allows you to easily migrate your elasticsearch mappings.

## Usage
```
  Usage: migriere-es [options]

  Options:

    -h, --help                  output usage information
    -V, --version               output the version number
    -i, --index <index>         The index name.
    -m, --mappings <mappings>   A json file with mappings.
    -n, --new                   Create new index without reindexing.
    -u, --url [url]             An url to a elasticsearch node. Defaults to `localhost:9200`.
    -l, --log-level [loglevel]  The log level. Defaults to `error`. Set this option to`debug` to see the queries this script performs.
```
