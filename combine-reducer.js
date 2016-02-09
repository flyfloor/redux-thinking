const combineReducers = (reducers) => {
    return (state = {}, action) => {
        return Object.keys(reducers).reduce(
            (prev, key){
                prev[key] = reducers[key](state[key], action)
                return prev;
            },
            {}
        )
    }
}