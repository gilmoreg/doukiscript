const mockUtil = {
    sleep: () => {
        throw new Error('whooopps')
        // return Promise.resolve()
    },
    id: (str: string) => `#${str}`,
    getOperationDisplayName: (operation: string) => operation,
}

export default mockUtil;