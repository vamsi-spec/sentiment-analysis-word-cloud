"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, X, Plus } from "lucide-react"
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

    const text = await file.text()
    const newComments: Comment[] = []

    if (file.name.endsWith(".csv")) {
      // Simple CSV parsing - assumes comments are in first column
      const lines = text.split("\n")
      lines.forEach((line, index) => {
        if (line.trim() && index > 0) {
          // Skip header
          const comment = line.split(",")[0]?.replace(/"/g, "").trim()
          if (comment) {
            newComments.push({
              id: `file-${Date.now()}-${index}`,
              text: comment,
              source: file.name,
            })
          }
        }
      })
    } else {
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
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Drop files here or click to upload</h3>
            <p className="text-muted-foreground mb-4">Supports CSV and text files up to 10MB</p>
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
            <Plus className="w-4 h-4 mr-2" />
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
                <div key={comment.id} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30">
                  <FileText className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground break-words">{comment.text}</p>
                    {comment.source && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {comment.source}
                      </Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeComment(comment.id)} className="flex-shrink-0">
                    <X className="w-4 h-4" />
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
