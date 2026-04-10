export default {
  data() {
    return {
      pendingActions: {}
    }
  },
  methods: {
    isActionPending(actionKey) {
      return Boolean(this.pendingActions[actionKey])
    },
    setActionPending(actionKey, pending) {
      if (pending) {
        this.pendingActions = {
          ...this.pendingActions,
          [actionKey]: true
        }
        return
      }

      const nextPendingActions = { ...this.pendingActions }
      delete nextPendingActions[actionKey]
      this.pendingActions = nextPendingActions
    },
    async withAction(actionKey, handler) {
      if (this.isActionPending(actionKey)) {
        return undefined
      }

      this.setActionPending(actionKey, true)
      try {
        return await handler()
      } finally {
        this.setActionPending(actionKey, false)
      }
    }
  }
}
