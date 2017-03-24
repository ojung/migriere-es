# Elastic search migrations

Since the mappings can be subject to change and according to
[the elasticsearch docs](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-put-mapping.html#updating-field-mappings)
you can not change the mapping of a field, only add or remove (multi-)fields, I decided to write a tool that helps me migrate (reindex) my
data.
Basis for the workflow in this tool is a method from the elasticsearch [blog](https://www.elastic.co/blog/changing-mapping-with-zero-downtime) from 2013.
Basically instead of calling your index `my-index` this script will call your index `my-index_v0` with a new version each time you migrate and maintain an
alias for the latest version called `my-index`.

## Limitations
I know this tool is propably not helpful for people with massive indices since it copies all data. It would be possible to delete the old version, but
just adding new multi fields with new mappings is a better choice.
The script helped me a lot though in the prototyping phase of projects to not have too many multi fields.

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

## Install
`npm install -g migriere-es` (Requires node with async/await support)
