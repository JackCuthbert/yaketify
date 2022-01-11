import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  ChangeEventHandler
} from 'react'
import type { NextPage } from 'next'
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
import { Spinner } from '../components/Spinner'

const ffmpeg = createFFmpeg({
  log: true,
  corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js'
})

const YAKETY_FILE_URL = '/yakety.mp3'

const Home: NextPage = () => {
  const [isTranscoding, setIsTranscoding] = useState(false)
  const fileElementRef = useRef<HTMLInputElement>(null)
  const videoElementRef = useRef<HTMLVideoElement>(null)

  const [, /* transcodeMessage */ setTranscodeMessage] = useState<
    string | undefined
  >()
  const [videoFile, setVideoFile] = useState<File | undefined>()

  const [uploadedUrl, setUploadedUrl] = useState<string | undefined>()
  const [transcodedUrl, setTranscodedUrl] = useState<string | undefined>()

  const handleVideoFile: ChangeEventHandler<HTMLInputElement> = event => {
    const file = event.currentTarget.files?.[0]
    if (file == null) return

    setVideoFile(file)

    const url = URL.createObjectURL(file)

    setUploadedUrl(url)
  }

  useEffect(() => {
    if (uploadedUrl == null) return

    videoElementRef.current?.load()
  }, [uploadedUrl])

  const processVideo = useCallback(async () => {
    if (uploadedUrl == null) return
    setIsTranscoding(true)
    setTranscodeMessage('Loading ffmpeg-core.js')
    await ffmpeg.load()

    setTranscodeMessage('Transcoding...')
    ffmpeg.FS('writeFile', 'in.mp4', await fetchFile(uploadedUrl))
    ffmpeg.FS('writeFile', 'in.mp3', await fetchFile(YAKETY_FILE_URL))
    await ffmpeg.run('-i', 'in.mp4', '-i', 'in.mp3', '-shortest', 'out.mp4')

    setTranscodeMessage('Done')
    const data = ffmpeg.FS('readFile', 'out.mp4')

    setTranscodedUrl(
      URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
    )
    setIsTranscoding(false)
    videoElementRef.current?.load()
  }, [uploadedUrl])

  const reset = (): void => {
    setTranscodedUrl(undefined)
    setVideoFile(undefined)
    setUploadedUrl(undefined)

    if (fileElementRef?.current != null) {
      fileElementRef.current.value = ''
    }
  }

  const isReady = !isTranscoding && transcodedUrl == null && uploadedUrl == null

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
              onChange={handleVideoFile}
            />
          </div>

          <div className="flex space-x-6 items-center justify-center">
            <button
              onClick={processVideo}
              className="inline-flex items-center space-x-4 bg-blue-500 shadow-lg shadow-blue-500/50 text-lg text-blue-50 px-6 py-3 rounded-lg disabled:opacity-80 disabled:cursor-not-allowed"
              disabled={isReady || isTranscoding}
            >
              <span>Yaketify!</span>
              {isTranscoding && <Spinner />}
            </button>

            <button
              disabled={isReady}
              onClick={reset}
              className="text-gray-600 underline"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl text-center">Preview</h2>

          {transcodedUrl != null && videoFile != null && (
            <div className="mt-2">
              <p className="mb-4">
                <code>{videoFile.name}</code> (
                <a
                  className="text-blue-700 underline"
                  href={transcodedUrl}
                  download={videoFile.name.split('.')[0] + '-yakety' + '.mp4'}
                >
                  download
                </a>
                )
              </p>
              <div className="bg-white rounded-2xl shadow-xl shadow-gray-900/20 overflow-hidden">
                <video className="w-full h-auto" ref={videoElementRef} controls>
                  <source src={transcodedUrl} />
                </video>
              </div>
            </div>
          )}

          {transcodedUrl === undefined && (
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
