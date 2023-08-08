import Handler from './handler'
import SortieHandler from './sortie'

let reporters: Handler[] = []

export const handleResponse = (e: any) => {
  for (const reporter of reporters) {
    try {
      reporter.handle(e.detail.path.replace('/kcsapi/', ''), e.detail.body, e.detail.postBody)
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.stack)
      }
    }
  }
}

export const show = false

export const pluginDidLoad = () => {
  reporters = [new SortieHandler() as Handler]
  window.addEventListener('game.response', handleResponse)
}

export const pluginWillUnload = () => {
  reporters = []
  window.removeEventListener('game.response', handleResponse)
}
