"use client"

import React, { useState } from "react"
import { uploadVideo, startAnalysis, getStatus } from "@/lib/apiClient"
import { Video, Upload, Play, FileVideo, Info, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function VideoInputPanel({ onAnalysisStarted, onAnalysisComplete }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("info")
  const [currentVideo, setCurrentVideo] = useState(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      const validTypes = ["video/mp4", "video/avi", "video/x-msvideo", "video/quicktime", "video/x-matroska"]
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|avi|mov|mkv)$/i)) {
        setMessage("Invalid file type. Please select MP4, AVI, MOV, or MKV")
        setMessageType("error")
        return
      }
      setSelectedFile(file)
      setMessage(`Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`)
      setMessageType("info")
    }
  }

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      setMessage("Please select a video file first")
      setMessageType("error")
      return
    }

    try {
      setUploading(true)
      setMessage("Uploading video...")
      setMessageType("info")
      setUploadProgress(30)

      const uploadResult = await uploadVideo(selectedFile)
      if (!uploadResult.success) throw new Error(uploadResult.error || "Upload failed")

      setUploadProgress(60)
      setMessage(`Uploaded: ${uploadResult.filename}`)
      setMessageType("success")
      setCurrentVideo(uploadResult.filename)

      setUploading(false)
      setAnalyzing(true)
      setMessage("Starting AI analysis...")
      setMessageType("info")
      setUploadProgress(80)

      const analysisResult = await startAnalysis(uploadResult.filepath)
      if (!analysisResult.success) throw new Error(analysisResult.error || "Analysis failed to start")

      setUploadProgress(100)
      setMessage(`Analysis started! Session: ${analysisResult.session_id}`)
      setMessageType("success")

      if (onAnalysisStarted) onAnalysisStarted(analysisResult.session_id)

      pollAnalysisStatus()
    } catch (error) {
      console.error("Error:", error)
      setMessage(`Error: ${error.message}`)
      setMessageType("error")
      setUploading(false)
      setAnalyzing(false)
      setUploadProgress(0)
    }
  }

  const pollAnalysisStatus = async () => {
    let pollAttempts = 0
    const MAX_POLL_ATTEMPTS = 60
    let pollIntervalId = null

    const checkStatus = async () => {
      try {
        pollAttempts++
        const status = await getStatus()
        if (status.completed || (!status.running && pollAttempts > 5)) {
          setAnalyzing(false)
          setMessage("Analysis complete! View results below")
          setMessageType("success")
          setUploadProgress(0)
          setSelectedFile(null)
          if (pollIntervalId) clearInterval(pollIntervalId)
          if (onAnalysisComplete) onAnalysisComplete()
          return
        }
        if (pollAttempts >= MAX_POLL_ATTEMPTS) {
          setAnalyzing(false)
          setMessage("Analysis timeout. Please check backend logs.")
          setMessageType("error")
          setUploadProgress(0)
          if (pollIntervalId) clearInterval(pollIntervalId)
          return
        }
      } catch {
        pollAttempts++
        if (pollAttempts >= 10) {
          setAnalyzing(false)
          setMessage("Error checking status. Please refresh.")
          setMessageType("error")
          setUploadProgress(0)
          if (pollIntervalId) clearInterval(pollIntervalId)
        }
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 3000))
    await checkStatus()
    pollIntervalId = setInterval(checkStatus, 3000)
  }

  return (
    <div className="bg-slate-900/80 border border-slate-700/50 backdrop-blur-md rounded-xl overflow-hidden shadow-lg">
      <div className="px-5 py-3 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/20">
        <div className="flex items-center gap-2 text-blue-400 font-semibold tracking-wide text-sm uppercase">
          <Video size={16} />
          Input Drone Video
        </div>
        <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full">
          Upload & Analyze
        </span>
      </div>

      <div className="p-5 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex-1 cursor-pointer">
            <input
              type="file"
              accept="video/mp4,video/avi,video/quicktime,video/x-matroska,.mp4,.avi,.mov,.mkv"
              onChange={handleFileSelect}
              disabled={uploading || analyzing}
              className="hidden"
            />
            <div className={cn(
              "flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg text-sm font-medium transition-all",
              uploading || analyzing
                ? "border-slate-700 text-slate-600 cursor-not-allowed"
                : "border-slate-600 text-slate-300 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5"
            )}>
              <FileVideo size={18} />
              {selectedFile ? "Change Video" : "Select Video File"}
            </div>
          </label>

          <button
            onClick={handleUploadAndAnalyze}
            disabled={!selectedFile || uploading || analyzing}
            className={cn(
              "flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all",
              !selectedFile || uploading || analyzing
                ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20"
            )}
          >
            {uploading ? (
              <><Loader2 size={16} className="animate-spin" /> Uploading...</>
            ) : analyzing ? (
              <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
            ) : (
              <><Play size={16} /> Upload & Analyze</>
            )}
          </button>
        </div>

        {selectedFile && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-xs font-mono text-slate-300 flex items-center gap-3">
            <FileVideo size={14} className="text-blue-400 shrink-0" />
            <span className="truncate">{selectedFile.name}</span>
            <span className="text-slate-500 shrink-0">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
          </div>
        )}

        {(uploading || analyzing) && uploadProgress > 0 && (
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {message && (
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium",
            messageType === "error" && "bg-red-500/10 text-red-400 border border-red-500/20",
            messageType === "success" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
            messageType === "info" && "bg-blue-500/10 text-blue-400 border border-blue-500/20"
          )}>
            {messageType === "error" && <XCircle size={14} />}
            {messageType === "success" && <CheckCircle2 size={14} />}
            {messageType === "info" && <Loader2 size={14} className="animate-spin" />}
            {message}
          </div>
        )}

        {currentVideo && !analyzing && (
          <div className="text-xs text-slate-500 font-mono">Current: {currentVideo}</div>
        )}

        <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-slate-400 flex items-center gap-1 mb-2">
            <Info size={12} /> Instructions
          </h4>
          <ul className="text-xs text-slate-500 flex flex-col gap-1 leading-relaxed">
            <li>Select a drone video file (MP4, AVI, MOV, MKV)</li>
            <li>Click "Upload & Analyze" to start processing</li>
            <li>YOLOv8 will analyze the video in real-time</li>
            <li>All panels will refresh with new detections</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
