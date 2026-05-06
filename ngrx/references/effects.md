# Effects


## Handling result of the backend requests

TODO mapResponse 


## Retrieving additional state from state slices

Effects are often triggered by events and events have payload, which is often sufficient for the effect execution, 
but sometimes we need to retrieve some additional state from the state slices using selectors

TODO concatLatestFrom

## Effects triggered by selectors

### Selector data change as an event

### Feature independent reloading of data based on path params