# argentina-covid19-data

Since there is no official API provided I decided to create my own source.

# background

Argentina goverment provides [daily information](https://www.argentina.gob.ar/coronavirus/informe-diario) about corona virus cases in a PDF format.
It does not respect any pattern, files are named differently and content has many variations from file to file.

Wikipedia did some effort to translate that data [here](https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Argentina). That's the only source which can be parsed, and that's the source of truth of this API

# endpoints

api/v0/daily: daily cases in the following format

```js
date: {
  "buenos_aires" : { "confirmed": number },
  "cordoba" : { "confirmed": number },
  ...
  "total_infections" : number,
  "total_deaths" : number,
  "new_cases" : number,
  "new_deaths" : number,
}
```
