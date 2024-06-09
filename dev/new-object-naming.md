# Object Naming Conventions

## Ending In `...Manager`
Typically these objects are used to access other data,
and they usually describe an object that has methods and 
stores data, but they are usually not called by the user
directly, and are used to abstract lower methods.

## Ending in `...Warehouse`
These objects typically are used primarily as a storage
class, they may have a few methods for accessing that data
but typically they just contain the data.

## Ending in `...Params`
These are interfaces that define a optional parameters
dictionary for a function, typically in that same file.