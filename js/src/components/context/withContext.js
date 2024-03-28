function withContext(Component, ContextProvider) {
    return function withContextComponent({ ...props }) {
        return (
            <ContextProvider>
                <Component {...props} />
            </ContextProvider>
        );
    };
}
export default withContext;
