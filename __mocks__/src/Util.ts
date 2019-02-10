const mockUtil = {
    sleep: () => Promise.resolve(),
    id: (str: string) => `#${str}`,
    getOperationDisplayName: (operation: string) => operation,
}

export default mockUtil;