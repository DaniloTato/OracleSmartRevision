type Listener = () => void

const listeners: Listener[] = []

export function subscribe(listener: Listener) {
    listeners.push(listener)
    return () => {
        const index = listeners.indexOf(listener)
        if (index !== -1) listeners.splice(index, 1)
    }
}

export function notify() {

    listeners.forEach((l) => l())

}