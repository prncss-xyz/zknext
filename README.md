# ZKNext [![codecov](https://codecov.io/gh/prncss-xyz/zknext/graph/badge.svg?token=Cr8b8ecEC5)](https://codecov.io/gh/prncss-xyz/zknext)

This is a small next application I use to visualize and navigate my note collection. These notes
are simply markdown files with optional metadata as a YAML preamble. The app consists of a Next server
which scans a watches the notes directory and lets it be explored in a structured way.

## Configuration

`ZK_NOTEBOOK_DIR`: contains the notes' directory (this is because I also use [zk](https://github.com/zk-org/zk) language server).

`ZK_NEXT_DEMO`: if set to `ZK_NEXT_DEMO`, will not restrain access to localhost.

## Technologies

**Remark** is used to parse markdown, both for rendering and to extract metadata. **Zod** is then used for 
some validation. An **Sqlite** database (with **Kisely**) is used to cache results. **Inversify** 
is used for dependency injection.

State management is made with Zustand and Optics-ts.

## Known issues

Due to a bug in `fs.watch`, the app will crash on file delition. However, this is a [fixed issue](https://github.com/nodejs/node/pull/52349), so we can just wait for node to update.
