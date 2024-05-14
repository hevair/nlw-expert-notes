import * as Dialog from "@radix-ui/react-dialog"
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from "react"
import { toast } from 'sonner'


interface NewNoteCardProps {
    note: {
        date: Date
        content: string
    },
    onNoteCreated: (content: string) => void
}

let  speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ note, onNoteCreated }: NewNoteCardProps) {

    const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
    const [content, setContent] = useState('')
    const [isRecording, setIsRecording] = useState(false)
    
    function handleStartEditor() {
        setShouldShowOnboarding(false)
    }

    function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
        setContent(event.target.value)
        if (event.target.value === '') {
            setShouldShowOnboarding(true)
        }
    }

    function handleSaveNote(event: FormEvent) {
        event.preventDefault()
        if(content === ''){
            return
        }

        onNoteCreated(content)
        setContent('')
        setShouldShowOnboarding(true)
        toast.success('Nota Criada com sucesso!!!!')
    }

    function handleStartRecording() {

        const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window
        || 'webkitSpeechRecognition' in window

        if(!isSpeechRecognitionAPIAvailable){
            alert('Infelizmente eu navegador não suporta gravar ')
            return
        }
            
        setIsRecording(true)
        setShouldShowOnboarding(false)

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

        speechRecognition = new SpeechRecognitionAPI()

        speechRecognition.lang = 'pt-BR'
        speechRecognition.continuous = true
        speechRecognition.maxAlternatives = 1
        speechRecognition.interimResults = true
        speechRecognition.onresult = (event) => {
            const transcription = Array.from(event.results).reduce((text, result) => {
                return text.concat(result[0].transcript)
            },'')

            setContent(transcription)
        }

        speechRecognition.onerror = (event) => {
            console.error(event)
        }

        speechRecognition.start()
        
    }


    function handleStopRecording() {
        setIsRecording(false)

        if(speechRecognition !== null){
            speechRecognition.stop()
        }
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger className='rounded-md text-left flex-col gap-3 bg-slate-700 p-5 space-y-3 overflow-hidden relative outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400'>
                <span className='text-sm font-medium text-slate-300'>Adicionar nota</span>
                <p className='text-sm leading-6 text-slate-400'>{note.content}</p>
                <div className='absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to to-black/0 pointer-events-none'></div>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="inset-0 fixed bg-black/60" />

                <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] md:h-[60vh] w-full bg-slate-700 md:rounded-md flex flex-col outline-none ">
                    <Dialog.Close className="absolute right-0 top-0 p-1.5 text-slate-400 hover:text-slate-300">
                        <X className="size-5" />
                    </Dialog.Close>
                    <form className="flex-1 flex flex-col">
                        <div className="flex flex-1 flex-col gap-3 p-5">
                            <span className="text-sm font-medium text-slate-300">

                                Adicionar nota
                            </span>
                            {shouldShowOnboarding ? (
                                <p className="text-sm leading-6 text-slate-400">
                                    Comece <button type="button" onClick={handleStartRecording} className="text-lime-500 hover:underline">gravando uma nota</button> em audio ou se preferir <button type="button" className="text-lime-500 hover:underline" onClick={handleStartEditor}>utilize apenas texto.</button>
                                </p>
                            ) : (
                                <textarea autoFocus onChange={handleContentChange} value={content} className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none" />
                            )}
                        </div>

                        {isRecording ? (
                            <button type="button"
                            onClick={handleStopRecording}
                                className="w-full flex gap-3 items-center justify-center font-medium bg-slate-900 py-4 text-center text-sm text-slate-100 outline-none 
                        hover:bg-lime-500">
                                <div className="size-3 rounded-full bg-red-500 animate-pulse"/>
                                <span className=" group-hover:underline ">Gravando! (clique para interromper)</span>
                            </button>
                        ) : (
                            <button type="button"
                            onClick={handleSaveNote}
                                className="w-full font-medium bg-lime-400 py-4 text-center text-sm text-lime-900 outline-none 
                        hover:bg-lime-500">
                                <span className=" group-hover:underline ">Salvar nota</span>
                            </button>
                        )}

                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>

    );
}