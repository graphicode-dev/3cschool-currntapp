export const groupsKeys = {
    all: ["groups"] as const,

    lists: () => [...groupsKeys.all, "list"] as const,
    list: (params?: any) => [...groupsKeys.lists(), params ?? {}] as const,

    details: () => [...groupsKeys.all, "detail"] as const,
    detail: (id: string | number) =>
        [...groupsKeys.details(), String(id)] as const,

    chat: () => [...groupsKeys.all, "chat"] as const,

    /** Infinite query key for group chat */
    groupChat: (groupId: string | number) =>
        [...groupsKeys.chat(), "group", String(groupId)] as const,

    privateMessages: () => [...groupsKeys.all, "messages"] as const,

    /** Infinite query key for private messages */
    privateMessagesList: (groupId: string | number, userId: string | number) =>
        [
            ...groupsKeys.privateMessages(),
            String(groupId),
            String(userId),
        ] as const,

    unread: () => [...groupsKeys.all, "unread"] as const,
};

export type GroupsQueryKey =
    | typeof groupsKeys.all
    | ReturnType<typeof groupsKeys.lists>
    | ReturnType<typeof groupsKeys.list>
    | ReturnType<typeof groupsKeys.details>
    | ReturnType<typeof groupsKeys.detail>
    | ReturnType<typeof groupsKeys.chat>
    | ReturnType<typeof groupsKeys.groupChat>
    | ReturnType<typeof groupsKeys.privateMessages>
    | ReturnType<typeof groupsKeys.privateMessagesList>
    | ReturnType<typeof groupsKeys.unread>;
