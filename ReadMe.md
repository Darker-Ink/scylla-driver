# Scylla-driver

scylla-driver is a "drop-in" replacement for cassandra-driver which tries to improve the developer experience when using ScyllaDB / Cassandra.


This project is a very work in progress and is not ready for production use. If you want to come help join our [Discord Server](https://discord.gg/DaBDBYS48Q) and say hi! (we don't bite)

## Old Backwards Compatibility?

cassandra-driver has a ton of functions which are for backwards compatibility with older versions of cassandra-driver and were deprecated, We've decided to go ahead and remove all of these functions and only support the latest version of cassandra-driver. The reasonf or this as it adds more bloat to the codebase and makes it harder to maintain. If you got a ton of code that DEPENDS on these functions and you don't want to update, then this project may not be for you.


With that, I'm also going to be splitting (and or turning into a static class) objects which have functions inside of them. So there may be a few breaking changes depending on how much you used from the library

# License

This code uses MIT license, all datastax code is under the [Apache 2.0 license](https://github.com/datastax/nodejs-driver/blob/master/LICENSE.txt).
