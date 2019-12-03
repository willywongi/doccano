<template>
  <base-card
    title="Upload Label"
    agree-text="Upload"
    cancel-text="Cancel"
    :disabled="!valid"
    @agree="create"
    @cancel="cancel"
  >
    <template #content>
      <v-form
        ref="form"
        v-model="valid"
      >
        <v-alert
          v-show="showError"
          v-model="showError"
          type="error"
          dismissible
        >
          <div
            v-for="(message, index) in errorMessages"
            :key="index"
          >
            {{ message }}
          </div>
        </v-alert>
        <h2>Select a file</h2>
        <v-file-input
          v-model="file"
          accept=".json"
          :rules="uploadFileRules"
          label="File input"
        />
      </v-form>
    </template>
  </base-card>
</template>

<script>
import BaseCard from '@/components/molecules/BaseCard'
import { uploadFileRules } from '@/rules/index'

export default {
  components: {
    BaseCard
  },
  props: {
    importLabel: {
      type: Function,
      default: () => {},
      required: true
    },
    errorMessages: {
      type: Array,
      default: () => [],
      required: true
    }
  },
  data() {
    return {
      valid: false,
      file: null,
      uploadFileRules,
      showError: false
    }
  },

  methods: {
    cancel() {
      this.$emit('close')
    },
    validate() {
      return this.$refs.form.validate()
    },
    reset() {
      this.$refs.form.reset()
    },
    async create() {
      if (this.validate()) {
        await this.importLabel({
          projectId: this.$route.params.id,
          file: this.file
        })
        if (this.errorMessages) {
          this.showError = true
        } else {
          this.reset()
          this.cancel()
        }
      }
    }
  }
}
</script>
