# Rule.js [![status][badge-url]][ci-url]
Build serializable conditions / business rules.

This repository is used to host multiple projects:
- [@rule.js/core](packages/core): This is the core library handling building
and running a condition.
- [@rule.js/elasticsearch](packages/elasticsearch): Convert your rule into an
elasticsearch query.
- [@rule.js/contextualize](packages/contextualize): Replace certain keys
in your conditions with data.
- [@rule.js/access-mate](packages/access-mate): Attribute-based access control
using rule.js conditions.
- [@rule.js/constraint](packages/constraint): Data constraints module
leveraging the core library.
- [@rule.js/expression](packages/expression): A simple language for expressing
business rules.

[badge-url]: https://travis-ci.org/AGhost-7/o-is.svg?branch=master
[ci-url]: https://travis-ci.org/AGhost-7/o-is
