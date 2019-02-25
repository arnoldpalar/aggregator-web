import axios from 'axios'

export function processDialog (intent, params, state, $q) {
  switch (intent) {
    case 'travel.start': travelStart(params, state, $q)
      break
    case 'set.option': setOption(params, state)
      break
    case 'restart.selection': restartSelection(params, state)
      break
    case 'confirm.selection': confirmSelection(params, state)
      break
    default: console.log('Unknown intent')
  }
}

function travelStart (params, state, $q) {
  console.log('travel.start intent detected, params: ' + JSON.stringify(params))

  let message = 'Don\'t have a trip without travel insurance, please pick one'
  if (params.destination && params.departure && params.return) {
    message = `So you are going to ${params.destination} from ${new Date(params.departure).toLocaleDateString()} to ${new Date(params.return).toLocaleDateString()}. Please pick a travel insurance`
  } else if (params.destination && params.departure) {
    message = `So you are going to ${params.destination} on ${new Date(params.departure).toLocaleDateString()}. Please pick a travel insurance`
  } else if (params.destination) {
    message = `So you are going to ${params.destination}. Please pick a travel insurance`
  } else {
    message = 'Where are you going again?'
    return
  }
  state.message = message

  axios.get(`${process.env.API}/insurance/travel?destination=${params.destination}${params.departure ? `&departure=${params.departure}` : ''}`)
    .then((response) => {
      state.listItems = [].concat(response.data)
      state.nextIntents = ['set.option']
      state.params = Object.assign({}, state.params, params)
      console.log(state)
    })
    .catch(() => {
      $q.notify({
        color: 'negative',
        position: 'top',
        message: 'API call failed',
        icon: 'report_problem'
      })
    })
}

function setOption (params, state) {
  console.log('set.option intent detected, params: ' + JSON.stringify(params))

  if (state.listItems) {
    if (params['option-number']) {
      if (params['option-number'] <= state.listItems.length) {
        state.selectedItem = state.listItems[params['option-number'] - 1]
        state.nextIntents = ['confirm.selection', 'restart.selection']
        state.message = 'you are choosing ' + state.selectedItem.id
      } else {
        state.message = 'Sorry, there are only ' + state.listItems.length + 'options'
      }
    } else if (params['option-name']) {
      const low = params['option-name'].toLowerCase()
      state.selectedItem = state.listItems.find(i => i.id.toLowerCase() === low)

      if (state.selectedItem) {
        state.nextIntents = ['confirm.selection', 'restart.selection']
        state.message = 'you are choosing ' + state.selectedItem.id
      } else {
        state.message = 'Sorry, could you repeat?'
      }
    } else if (params['cheapest']) {
      state.selectedItem = state.listItems[0]
      state.nextIntents = ['confirm.selection', 'restart.selection']
      state.message = 'you are choosing ' + state.selectedItem.id
    } else {
      state.message = 'Sorry, could you repeat?'
    }
  }

  state.params = Object.assign({}, state.params, params)

  console.log(state)
}

function restartSelection(params, state) {
  state.selectedItem = undefined
  state.message = 'No problem! here the list again'
  state.nextIntents = ['set.option']
}

function confirmSelection(params, state) {
  state.selectionConfirmed = true;
  state.onConfirmed()
}
