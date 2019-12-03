import LabelService from '@/services/label.service'

export const state = () => ({
  items: [],
  selected: [],
  loading: false,
  errors: []
})

export const getters = {
  isLabelSelected(state) {
    return state.selected.length > 0
  },
  getErrorMessages(state) {
    return Array.from(new Set(state.errors))
  }
}

export const mutations = {
  setLabelList(state, payload) {
    state.items = payload
  },
  addLabel(state, label) {
    state.items.unshift(label)
  },
  deleteLabel(state, labelId) {
    state.items = state.items.filter(item => item.id !== labelId)
  },
  updateSelected(state, selected) {
    state.selected = selected
  },
  updateLabel(state, label) {
    const item = state.items.find(item => item.id === label.id)
    Object.assign(item, label)
  },
  resetSelected(state) {
    state.selected = []
  },
  setLoading(state, payload) {
    state.loading = payload
  },
  addError(state, payload) {
    state.errors.push(payload)
  },
  clearErrors(state) {
    state.errors = []
  }
}

export const actions = {
  getLabelList({ commit }, payload) {
    commit('setLoading', true)
    return LabelService.getLabelList(payload.projectId)
      .then((response) => {
        commit('setLabelList', response.data)
      })
      .catch((error) => {
        alert(error)
      })
      .finally(() => {
        commit('setLoading', false)
      })
  },
  createLabel({ commit }, data) {
    return LabelService.addLabel(data.projectId, data)
      .then((response) => {
        commit('addLabel', response.data)
      })
  },
  updateLabel({ commit }, data) {
    LabelService.updateLabel(data.projectId, data.id, data)
      .then((response) => {
        commit('updateLabel', response.data)
      })
      .catch((error) => {
        alert(error)
      })
  },
  deleteLabel({ commit, state }, projectId) {
    for (const label of state.selected) {
      LabelService.deleteLabel(projectId, label.id)
        .then((response) => {
          commit('deleteLabel', label.id)
        })
        .catch((error) => {
          alert(error)
        })
    }
    commit('resetSelected')
  },
  importLabels({ commit, state }, payload) {
    commit('setLoading', true)
    commit('clearErrors')
    const formData = new FormData()
    formData.append('file', payload.file)
    const reader = new FileReader()
    reader.onload = (e) => {
      let labels
      try {
        labels = JSON.parse(e.target.result)
      } catch (e) {
        commit('addError', 'Invalid file format.')
        return
      }
      for (const label of labels) {
        LabelService.addLabel(payload.projectId, label)
          .then((response) => {
            commit('addLabel', response.data)
          })
          .catch((error) => {
            if (error.response.data.non_field_errors) {
              error.response.data.non_field_errors.forEach((msg) => {
                commit('addError', `${label.text} is ${msg}`)
              })
            } else if (error.response.data) {
              for (const field in error.response.data) {
                const msg = error.response.data[field][0]
                commit('addError', `Field ${field}: ${msg}`)
              }
            } else {
              commit('addError', 'You cannot use same label name or shortcut key.')
            }
          })
      }
    }
    reader.readAsText(payload.file)
    commit('setLoading', false)
  },
  exportLabels({ commit }, payload) {
    commit('setLoading', true)
    LabelService.getLabelList(payload.projectId)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([JSON.stringify(response.data)]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `project_${payload.projectId}_labels.json`)
        document.body.appendChild(link)
        link.click()
      })
      .catch((error) => {
        alert(error)
      })
      .finally(() => {
        commit('setLoading', false)
      })
  }
}
