<template>
  <q-icon name="fas fa-microphone"/>
</template>

<script>
export default {
  name: 'SayItSpeech',

  props: {
    lang: {
      type: String,
      default: 'en-US'
    }
  },

  data: () => ({
    runtimeTranscription: '',
    transcription: []
  }),

  methods: {
    checkApi () {
      window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (!window.SpeechRecognition && process.env.NODE_ENV !== 'production') {
        throw new Error('Speech Recognition does not exist on this browser. Use Chrome or Firefox')
      }
      if (!window.SpeechRecognition) {
        return
      }

      const recognition = new window.SpeechRecognition()
      recognition.lang = this.lang
      recognition.interimResults = true

      recognition.addEventListener('result', event => {
        const text = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')
        this.runtimeTranscription = text
      })

      recognition.addEventListener('end', () => {
        if (this.runtimeTranscription !== '') {
          this.transcription.push(this.runtimeTranscription)
          this.$emit('onTranscriptionEnd', {
            transcription: this.transcription,
            lastSentence: this.runtimeTranscription
          })
        }
        this.runtimeTranscription = ''
        recognition.start()
      })

      recognition.start()
    }
  },
  mounted () {
    this.checkApi()
  }

}
</script>

<style scoped>

</style>
