"use client"

import * as React from "react"
import {
  MessageSquare,
  Send,
  Trash2,
  Pencil,
  X,
  Check,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  useBugComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "@/hooks/use-bugs"
import type { BugComment } from "@/lib/types"
import { format, formatDistanceToNow, isToday } from "date-fns"
import { cn } from "@/lib/utils"

const AVATAR_COLORS = [
  "bg-rose-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
  "bg-teal-500",
  "bg-orange-500",
]

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function CommentsSection({ bugId }: { bugId: string }) {
  const { data, isLoading } = useBugComments(bugId)
  const createMut = useCreateComment(bugId)

  const [body, setBody] = React.useState("")
  const [author, setAuthor] = React.useState("")
  const comments = data?.data ?? []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    createMut.mutate(
      { body: body.trim(), author: author.trim() || undefined },
      {
        onSuccess: () => {
          setBody("")
        },
      },
    )
  }

  return (
    <Card className="no-print">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              Discussion
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              {comments.length === 0
                ? "No comments yet — start the discussion"
                : `${comments.length} comment${comments.length === 1 ? "" : "s"}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Comment list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <MessageSquare className="h-7 w-7 mx-auto opacity-40 mb-2" />
            <p className="font-medium">No comments yet</p>
            <p className="text-xs mt-0.5">Be the first to comment on this bug.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentItem key={comment.id} bugId={bugId} comment={comment} />
            ))}
          </div>
        )}

        {/* New comment form */}
        <form onSubmit={handleSubmit} className="space-y-2 pt-3 border-t">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Your name (optional)"
                className="h-8 text-xs"
                maxLength={60}
              />
            </div>
          </div>
          <div className="relative">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a comment… (markdown supported)"
              className="min-h-[72px] text-sm resize-y scrollbar-thin pr-24"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault()
                  if (body.trim()) handleSubmit(e)
                }
              }}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute bottom-2 right-2 h-7 gap-1.5 text-xs"
              disabled={!body.trim() || createMut.isPending}
            >
              {createMut.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Comment
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Press <kbd className="rounded border bg-muted px-1 py-0.5 font-mono">⌘+Enter</kbd> to send
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

function CommentItem({ bugId, comment }: { bugId: string; comment: BugComment }) {
  const deleteMut = useDeleteComment(bugId)
  const updateMut = useUpdateComment(bugId)
  const [editing, setEditing] = React.useState(false)
  const [editBody, setEditBody] = React.useState(comment.body)

  const handleSaveEdit = () => {
    if (!editBody.trim() || editBody === comment.body) {
      setEditing(false)
      setEditBody(comment.body)
      return
    }
    updateMut.mutate(
      { commentId: comment.id, body: editBody.trim() },
      { onSuccess: () => setEditing(false) },
    )
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setEditBody(comment.body)
  }

  const isEdited = comment.updatedAt !== comment.createdAt

  return (
    <div className="flex items-start gap-3 group animate-fade-in">
      {/* Avatar */}
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0",
          avatarColor(comment.author),
        )}
        title={comment.author}
      >
        {initials(comment.author)}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold">{comment.author}</span>
          <span className="text-[10px] text-muted-foreground">
            {isToday(new Date(comment.createdAt))
              ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
              : format(new Date(comment.createdAt), "MMM d 'at' HH:mm")}
          </span>
          {isEdited && (
            <span className="text-[10px] text-muted-foreground italic">(edited)</span>
          )}
        </div>

        {/* Body / edit form */}
        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              className="min-h-[72px] text-sm resize-y scrollbar-thin"
              autoFocus
            />
            <div className="flex items-center justify-end gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={handleCancelEdit}
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-7 gap-1 text-xs"
                onClick={handleSaveEdit}
                disabled={!editBody.trim() || updateMut.isPending}
              >
                {updateMut.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative rounded-lg bg-muted/50 border px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words">
            {comment.body}
            {/* Hover actions */}
            <div className="absolute top-1 right-1 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setEditing(true)}
                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                title="Edit comment"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-destructive"
                    title="Delete comment"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      The comment will be permanently removed. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMut.mutate(comment.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
