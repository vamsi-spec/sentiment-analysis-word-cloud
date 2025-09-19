"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface Comment {
  id: string
  text: string
  source?: string
}

interface CommentInputProps {
  onCommentsChange: (comments: Comment[]) => void
}

export function CommentInput({ onCommentsChange }: CommentInputProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleFiles = async (files: FileList) => {
    const file = files[0]
    if (!file) return

    console.log("[v0] Processing file:", file.name, "Size:", file.size)

    const text = await file.text()
    const newComments: Comment[] = []

    if (file.name.endsWith(".csv")) {
      console.log("[v0] Processing CSV file")
      const lines = text.split("\n")
      const header = lines[0]?.toLowerCase() || ""

      // Try to find comment column by looking for common keywords
      const headerCols = header.split(",").map((col) => col.trim().replace(/"/g, ""))
      let commentColIndex = 0

      // Look for comment-related column names
      const commentKeywords = ["comment", "feedback", "text", "message", "review", "response"]
      for (let i = 0; i < headerCols.length; i++) {
        if (commentKeywords.some((keyword) => headerCols[i].includes(keyword))) {
          commentColIndex = i
          break
        }
      }

      console.log("[v0] Using column index:", commentColIndex, "Header:", headerCols[commentColIndex])

      lines.forEach((line, index) => {
        if (line.trim() && index > 0) {
          // Skip header
          // Handle CSV with proper quote parsing
          const cols = []
          let current = ""
          let inQuotes = false

          for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === "," && !inQuotes) {
              cols.push(current.trim())
              current = ""
            } else {
              current += char
            }
          }
          cols.push(current.trim()) // Add last column

          const comment = cols[commentColIndex]?.replace(/^"|"$/g, "").trim()
          if (comment && comment.length > 0) {
            newComments.push({
              id: `file-${Date.now()}-${index}`,
              text: comment,
              source: file.name,
            })
          }
        }
      })
    } else {
      console.log("[v0] Processing text file")
      // Plain text - split by lines
      const lines = text.split("\n")
      lines.forEach((line, index) => {
        if (line.trim()) {
          newComments.push({
            id: `file-${Date.now()}-${index}`,
            text: line.trim(),
            source: file.name,
          })
        }
      })
    }

    console.log("[v0] Loaded comments:", newComments.length)
    const updatedComments = [...comments, ...newComments]
    setComments(updatedComments)
    onCommentsChange(updatedComments)
  }

  const addComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: `manual-${Date.now()}`,
        text: newComment.trim(),
      }
      const updatedComments = [...comments, comment]
      setComments(updatedComments)
      onCommentsChange(updatedComments)
      setNewComment("")
    }
  }

  const removeComment = (id: string) => {
    const updatedComments = comments.filter((c) => c.id !== id)
    setComments(updatedComments)
    onCommentsChange(updatedComments)
  }

  const clearAll = () => {
    setComments([])
    onCommentsChange([])
  }

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Comments Data</CardTitle>
          <CardDescription>Upload CSV, text files, or paste comments directly</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-lg font-semibold mb-2">Drop files here or click to upload</h3>
            <p className="text-gray-600 mb-4">Supports CSV and text files up to 10MB</p>
            <Input
              type="file"
              accept=".csv,.txt,.text"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer bg-transparent">
                Choose Files
              </Button>
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Manual Comment Input */}
      <Card>
        <CardHeader>
          <CardTitle>Add Individual Comment</CardTitle>
          <CardDescription>Manually add comments for analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment-text">Comment Text</Label>
            <Textarea
              id="comment-text"
              placeholder="Enter a comment or feedback to analyze..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
          </div>
          <Button onClick={addComment} disabled={!newComment.trim()}>
            <span className="mr-2">➕</span>
            Add Comment
          </Button>
        </CardContent>
      </Card>

      {/* Comments List */}
      {comments.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Loaded Comments ({comments.length})</CardTitle>
                <CardDescription>Comments ready for sentiment analysis</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 p-3 border rounded-lg bg-gray-50">
                  <span className="text-lg mt-1">📄</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm break-words">{comment.text}</p>
                    {comment.source && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {comment.source}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeComment(comment.id)} className="flex-shrink-0">
                    <span>❌</span>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
