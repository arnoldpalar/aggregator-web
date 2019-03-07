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

      <div v-if="dialogState.selectedItem && !dialogState.selectionConfirmed">
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

      <div v-if="dialogState.selectionConfirmed">

      </div>
    </main>

    <q-modal v-if="selectedItem" v-model="confirmationModal">
      <q-list highlight>
        <q-list-header>Provider</q-list-header>
        <q-item>
          <q-item-main :label="selectedItem.provider"/>
        </q-item>

        <q-item-separator />

        <q-list-header>Price</q-list-header>
        <q-item>
          <q-item-main :label="selectedItem.price + ''"/>
        </q-item>

        <q-item-separator />

        <q-list-header>Coverages</q-list-header>
        <q-item v-for="(detail, name) in selectedItem.coverages" :key="name">
          <q-item-main :label="name + ' : ' + detail" />
        </q-item>
      </q-list>
    </q-modal>
  </q-page>
</template>

<style>
</style>

<script>
import SayItSpeech from '../components/SayItSpeech'
import TravelDialog from '../service/TravelDialog'

export default {
  name: 'SayItIndex',
  components: { SayItSpeech },

  data () {
    return {
      dialogState: {
        nextIntents: [],
        message: 'What\'s your plan?',
        listItems: [],
        selectedItem: undefined,
        selectionConfirmed: false,
        onConfirmed: this.onConfirmed,
        currentDialog: undefined
      },
      confirmationModal: false,
      selectedItem: undefined,
      sessionId: 'SESS_' + new Date().getMilliseconds()
    }
  },

  methods: {
    onEnd ({ lastSentence, transcription }) {
      console.log('lastSentence: ' + lastSentence)
      console.log('transcription: ' + transcription)

      this.$axios.post(process.env.API + '/feed', {
        sessionId: this.sessionId,
        text: lastSentence
      })
        .then((response) => {
          if (response.data && response.data.intent) {

            if(this.dialogState.currentDialog === undefined) {
              switch (response.data.intent) {
                case 'travel.start': this.dialogState.currentDialog = new TravelDialog()
                  break
                default: {
                  this.dialogState.message = 'Sorry, your request is currently not supported. Please try another request'
                  return
                }
              }
            } else if (!this.dialogState.nextIntents.includes(response.data.intent)) {
              this.dialogState.message = 'Cannot proceed your intent at this state'
              return
            }

            this.dialogState.currentDialog.processDialog(response.data.intent, response.data.params, this.dialogState, this.$q)
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

      this.confirmationModal = true
      this.selectedItem = this.dialogState.selectedItem

      this.dialogState = {
        nextIntents: ['travel.start'],
        message: 'What\'s your plan?',
        listItems: [],
        selectedItem: undefined,
        selectionConfirmed: false,
        onConfirmed: this.onConfirmed,
        currentDialog: undefined
      }
    }
  }
}
</script>
