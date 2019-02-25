<template>
  <q-page>
    <q-jumbotron class="bg-primary" dark>
      <div class="q-display-3">
        <say-it-speech @onTranscriptionEnd="onEnd"/> {{dialogState.message}}
      </div>
    </q-jumbotron>
    <main>
      <div v-if="dialogState.listItems && !dialogState.selectedItem">
        <q-card v-for="item in dialogState.listItems" :key="item.id" class="bg-white q-ma-md" inline style="width: 300px">
          <q-card-title>
            {{item.provider}}
          </q-card-title>
          <q-card-main>
            <p>Price: ${{item.price}}/trip</p>
            <p class="text-faded">{{item.totalReview}} review</p>
          </q-card-main>
        </q-card>
      </div>

      <div v-if="dialogState.selectedItem">
        <q-card class="bg-white q-ma-md" inline style="width: 300px">
          <q-card-title>
            {{dialogState.selectedItem.provider}}
          </q-card-title>
          <q-card-main>
            <p>Price: ${{dialogState.selectedItem.price}}/trip</p>
            <p class="text-faded">{{dialogState.selectedItem.totalReview}} review</p>
          </q-card-main>
        </q-card>
      </div>
    </main>
  </q-page>
</template>

<style>
</style>

<script>
import SayItSpeech from '../components/SayItSpeech'
import { processDialog } from '../service'

export default {
  name: 'SayItIndex',
  components: { SayItSpeech },

  data () {
    return {
      dialogState: {
        nextIntents: ['travel.start'],
        message: 'What\'s your plan?',
        listItems: [],
        selectedItem: undefined,
        selectionConfirmed: false,
        onConfirmed: this.onConfirmed
      }
    }
  },

  methods: {
    onEnd ({ lastSentence, transcription }) {
      console.log('lastSentence: ' + lastSentence)
      console.log('transcription: ' + transcription)

      this.$axios.post(process.env.API + '/feed', {
        sessionId: 'SESS001',
        text: lastSentence
      })
        .then((response) => {
          if (response.data && response.data.intent && this.dialogState.nextIntents.includes(response.data.intent)) {
            processDialog(response.data.intent, response.data.params, this.dialogState, this.$q)
          }
        })
        .catch(() => {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: 'API call failed',
            icon: 'report_problem'
          })
        })
    },

    onConfirmed() {
      this.$q.dialog({
        title: 'Congratulation!',
        message: 'You have purchased a travel Insurance',

        color: 'primary',

        ok: true, // takes i18n value, or String for "OK" button label

        preventClose: true,

        noBackdropDismiss: false,
        noEscDismiss: false,

        stackButtons: true,

        position: 'top',
      })

      this.dialogState = {
        nextIntents: ['travel.start'],
        message: 'What\'s your plan?',
        listItems: [],
        selectedItem: undefined,
        selectionConfirmed: false,
        onConfirmed: this.onConfirmed
      }
    }
  }
}
</script>
