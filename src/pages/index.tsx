import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ChangeEventHandler
} from 'react'
import type { NextPage } from 'next'
import { createFFmpeg, fetchFile, FFmpeg } from '@ffmpeg/ffmpeg'
import { Spinner } from '../components/Spinner'

const YAKETY_FILE_URL = '/yakety.mp3'

let ffmpeg: FFmpeg | null = null

if (typeof window !== 'undefined') {
  ffmpeg = createFFmpeg({
    log: true,
    corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js'
  })
}

const Home: NextPage = () => {
  const [isTranscoding, setIsTranscoding] = useState(false)
  const fileElementRef = useRef<HTMLInputElement>(null)
  const videoElementRef = useRef<HTMLVideoElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | undefined>()

  const [sourceUrl, setSourceUrl] = useState<string | undefined>()
  const [destinationUrl, setDestinationUrl] = useState<string | undefined>()

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = event => {
    const file = event.currentTarget.files?.[0]
    if (file == null) return

    setSelectedFile(file)

    setSourceUrl(URL.createObjectURL(file))
    setDestinationUrl(undefined)
  }

  useEffect(() => {
    if (sourceUrl == null) return

    videoElementRef.current?.load()
  }, [sourceUrl])

  const processVideo = useCallback(async () => {
    if (ffmpeg == null) return

    if (sourceUrl == null) return
    setIsTranscoding(true)
    await ffmpeg.load()

    ffmpeg.FS('writeFile', 'in.mp4', await fetchFile(sourceUrl))
    ffmpeg.FS('writeFile', 'in.mp3', await fetchFile(YAKETY_FILE_URL))
    await ffmpeg.run('-i', 'in.mp4', '-i', 'in.mp3', '-shortest', 'out.mp4')

    const data = ffmpeg.FS('readFile', 'out.mp4')

    const blob = new Blob([data.buffer], { type: 'video/mp4' })
    setDestinationUrl(URL.createObjectURL(blob))

    setIsTranscoding(false)
    videoElementRef.current?.load()
  }, [sourceUrl])

  const reset = (): void => {
    setSourceUrl(undefined)
    setDestinationUrl(undefined)

    setSelectedFile(undefined)

    if (fileElementRef?.current != null) {
      fileElementRef.current.value = ''
    }
  }

  const transcodeAvailable =
    !isTranscoding && sourceUrl != null && destinationUrl == null

  return (
    <div className="min-h-screen bg-blue-50 pt-12 pb-12">
      <div className="max-w-3xl mx-auto px-6">
        <div className="mb-12 text-center">
          <h1 className="font-black text-4xl mb-2">Yaketify</h1>
          <p className="text-xl mb-4">Thanks, Richard.</p>
          <p className="text-sm text-gray-500">
            All transcoding is done locally in your browser.
          </p>
        </div>

        <div className="mb-12 text-center">
          <div className="bg-white rounded-2xl shadow-xl shadow-blue-300/10 px-6 py-8 mb-12">
            <input
              ref={fileElementRef}
              // TODO: Clean up this mess
              className="
                        block w-full text-xl text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-xl file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100
                        "
              type="file"
              accept="video/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex space-x-6 items-center justify-center">
            <button
              onClick={processVideo}
              className="inline-flex items-center space-x-4 bg-blue-500 shadow-lg shadow-blue-500/50 text-lg text-blue-50 px-6 py-3 rounded-lg disabled:opacity-80 disabled:cursor-not-allowed"
              disabled={!transcodeAvailable}
            >
              <span>Yaketify!</span>
              {isTranscoding && <Spinner />}
            </button>

            <button
              disabled={sourceUrl == null || isTranscoding}
              onClick={reset}
              className="text-gray-600 underline disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl text-center">Preview</h2>

          {destinationUrl != null && selectedFile != null && (
            <div className="mt-2">
              <p className="mb-4">
                <code>{selectedFile.name}</code> (
                <a
                  className="text-blue-700 underline"
                  href={destinationUrl}
                  download={
                    selectedFile.name.split('.')[0] + '-yakety' + '.mp4'
                  }
                >
                  download
                </a>
                )
              </p>
              <div className="bg-white rounded-2xl shadow-xl shadow-gray-900/20 overflow-hidden">
                <video className="w-full h-auto" ref={videoElementRef} controls>
                  <source src={destinationUrl} />
                </video>
              </div>
            </div>
          )}

          {destinationUrl === undefined && (
            <p className="mt-6 text-gray-600">
              Select a video file and click the button!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
