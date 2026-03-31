package com.panda.context;

public class BaseContext {

    private static final ThreadLocal<Long> THREAD_LOCAL = new ThreadLocal<>();

    private BaseContext() {
    }

    public static void setCurrentId(Long userId) {
        THREAD_LOCAL.set(userId);
    }

    public static Long getCurrentId() {
        return THREAD_LOCAL.get();
    }

    public static void removeCurrentId() {
        THREAD_LOCAL.remove();
    }
}
