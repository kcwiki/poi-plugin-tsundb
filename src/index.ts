import IHandler from './handlers'
import SortieHandler from './handlers/sortie'

let reporters: IHandler[] = []

export const handleResponse = (e: any) => {
  for (const reporter of reporters) {
    try {
      reporter.handle(e.detail.path.replace('/kcsapi/', ''), e.detail.body, e.detail.postBody)
    } catch (err) {
      console.error(err.stack)
    }
  }
}

export const show = false

export const pluginDidLoad = () => {
  reporters = [new SortieHandler() as IHandler]
  window.addEventListener('game.response', handleResponse)
}

export const pluginWillUnload = () => {
  reporters = []
  window.removeEventListener('game.response', handleResponse)
}
