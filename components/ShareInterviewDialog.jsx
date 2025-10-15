"use client";

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Share2, Mail, MessageCircle, Copy, Check, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/services/supabaseClient';

const ShareInterviewDialog = ({ interview }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [linkExpiry, setLinkExpiry] = useState('never');
  const [updating, setUpdating] = useState(false);

  const interviewUrl = `${process.env.NEXT_PUBLIC_HOST_URL}/interview/${interview?.interview_id}`;

  const updateLinkSecurity = async (expiryOption) => {
    setUpdating(true);
    try {
      let expiresAt = null;

      if (expiryOption === '1hour') {
        expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      } else if (expiryOption === '24hours') {
        expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (expiryOption === '7days') {
        expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      const { error } = await supabase
        .from('Interviews')
        .update({
          link_expires_at: expiresAt,
          is_link_active: true
        })
        .eq('interview_id', interview?.interview_id);

      if (error) throw error;

      toast.success('Link security settings updated');
    } catch (error) {
      console.error('Error updating link security:', error);
      toast.error('Failed to update link security');
    } finally {
      setUpdating(false);
    }
  };

  const handleExpiryChange = (value) => {
    setLinkExpiry(value);
    updateLinkSecurity(value);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(interviewUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaGmail = () => {
    const recipientName = candidateName || 'Candidate';
    const subject = encodeURIComponent(`Interview Invitation - ${interview?.jobPosition}`);
    const body = encodeURIComponent(
      `Dear ${recipientName},\n\n` +
      `You have been invited to participate in an AI-powered interview for the position of ${interview?.jobPosition}.\n\n` +
      `Interview Details:\n` +
      `Position: ${interview?.jobPosition}\n` +
      `Duration: ${interview?.duration} minutes\n` +
      `Experience Level: ${interview?.jobExperience} years\n\n` +
      `Please click on the link below to start your interview:\n` +
      `${interviewUrl}\n\n` +
      `Best of luck!\n\n` +
      `Regards,\n` +
      `NextHire Team`
    );

    const gmailUrl = candidateEmail
      ? `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(candidateEmail)}&su=${subject}&body=${body}`
      : `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;

    window.open(gmailUrl, '_blank');
    toast.success('Opening Gmail...');
  };

  const shareViaWhatsApp = () => {
    const recipientName = candidateName || 'Candidate';
    const message = encodeURIComponent(
      `Hi ${recipientName}!\n\n` +
      `You've been invited to participate in an AI interview for *${interview?.jobPosition}*.\n\n` +
      `*Interview Details:*\n` +
      `Position: ${interview?.jobPosition}\n` +
      `Duration: ${interview?.duration} minutes\n` +
      `Experience: ${interview?.jobExperience} years\n\n` +
      `Click here to start: ${interviewUrl}\n\n` +
      `Good luck!`
    );

    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Opening WhatsApp...');
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Share Interview Link</AlertDialogTitle>
          <AlertDialogDescription>
            Share this interview with candidates via email or messaging apps
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Candidate Name (Optional)
            </label>
            <Input
              placeholder="Enter candidate name"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Candidate Email (Optional)
            </label>
            <Input
              type="email"
              placeholder="candidate@example.com"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Interview Link
            </label>
            <div className="flex gap-2">
              <Input
                value={interviewUrl}
                readOnly
                className="flex-1 bg-gray-50"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <label className="text-sm font-medium text-gray-700">
                Link Security
              </label>
            </div>
            <Select value={linkExpiry} onValueChange={handleExpiryChange} disabled={updating}>
              <SelectTrigger>
                <SelectValue placeholder="Select expiration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never expires</SelectItem>
                <SelectItem value="1hour">Expires in 1 hour</SelectItem>
                <SelectItem value="24hours">Expires in 24 hours</SelectItem>
                <SelectItem value="7days">Expires in 7 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Set an expiration time to automatically disable the link after a certain period
            </p>
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">Share via:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={shareViaGmail}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
              >
                <Mail className="h-4 w-4" />
                Gmail
              </Button>
              <Button
                onClick={shareViaWhatsApp}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <AlertDialogCancel>Close</AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ShareInterviewDialog;
