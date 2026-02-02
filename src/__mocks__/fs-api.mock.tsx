let __mockedFileBody = '';

export function setMockedFile(mockedFileBody: string) {
    __mockedFileBody = mockedFileBody;
}

export const FileSystemWritableFileStreamMock = {
    write: jest.fn(),
    close: jest.fn()
}

export const createDirectoryHandleMock = (overrides?: Partial<FileSystemDirectoryHandle>): FileSystemDirectoryHandle => ({
    kind: 'directory',
    name: 'test-dir',
    getFileHandle: jest.fn().mockResolvedValue({
        kind: 'file',
        name: 'open-test',
        getFile: jest.fn().mockResolvedValue({ text: jest.fn(() => Promise.resolve(__mockedFileBody)) }),
        createWritable: jest.fn().mockResolvedValue(FileSystemWritableFileStreamMock)
    }),
    getDirectoryHandle: () => Promise.resolve(createDirectoryHandleMock(overrides)),
    removeEntry: function (name: string, options?: FileSystemRemoveOptions): Promise<void> {
        throw new Error("Function not implemented.");
    },
    resolve: function (possibleDescendant: FileSystemHandle): Promise<string[] | null> {
        throw new Error("Function not implemented.");
    },
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    isFile: false,
    isDirectory: true,
    getFile: function (name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle> {
        throw new Error("Function not implemented.");
    },
    getDirectory: function (name: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle> {
        throw new Error("Function not implemented.");
    },
    getEntries: jest.fn(),
    [Symbol.asyncIterator]: jest.fn(),
    isSameEntry: function (other: FileSystemHandle): Promise<boolean> {
        throw new Error("Function not implemented.");
    },
    queryPermission: function (descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState> {
        throw new Error("Function not implemented.");
    },
    requestPermission: function (descriptor?: FileSystemHandlePermissionDescriptor): Promise<PermissionState> {
        throw new Error("Function not implemented.");
    },
    ...overrides
} as unknown as FileSystemDirectoryHandle);

beforeEach(() => {
    setMockedFile('{}');

    global.showDirectoryPicker = jest.fn().mockResolvedValue(createDirectoryHandleMock())

    global.showOpenFilePicker = jest.fn().mockResolvedValue([
        { kind: 'file', name: 'open-test', getFile: jest.fn().mockResolvedValue({ text: jest.fn(() => Promise.resolve(__mockedFileBody)) }) }
    ]);

    global.showSaveFilePicker = jest.fn().mockResolvedValue({
        kind: 'file', name: 'save-test', createWritable: jest.fn().mockResolvedValue(FileSystemWritableFileStreamMock)
    })
}) 
