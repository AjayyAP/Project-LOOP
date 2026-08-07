const profiles = {
  Email: { specific: [['Password reset link expires before customers can use it', 'Several customers report that the password reset email arrives late and the link has already expired.', 'Bug', 'High', 'NEW'], ['Billing confirmation email is missing', 'Customers completed payment but did not receive a billing confirmation or invoice email.', 'Bug', 'High', 'NEW']], source: 'email support inbox' },
  Website: { specific: [['Contact form does not submit on mobile', 'Website visitors say the contact form spins indefinitely after they tap submit on mobile browsers.', 'Bug', 'High', 'NEW'], ['Homepage takes too long to load', 'Visitors report that the homepage loads slowly, especially when opening it from a shared link.', 'Improvement', 'Medium', 'REVIEWED']], source: 'website feedback form' },
  'Play Store': { specific: [['Android app crashes after the latest update', 'Several Android users say the app closes immediately after they install the newest version.', 'Bug', 'High', 'NEW'], ['Login screen loops after sign in', 'Play Store users report being returned to the login screen even after entering valid credentials.', 'Bug', 'High', 'NEW']], source: 'Google Play Store review' },
  'App Store': { specific: [['Dark mode colors make text difficult to read', 'iPhone users report low contrast text and unreadable labels when dark mode is enabled.', 'Improvement', 'Medium', 'NEW'], ['Face ID fails after reopening the app', 'Users say Face ID works once but does not unlock the app after it is closed and reopened.', 'Bug', 'High', 'NEW']], source: 'Apple App Store review' },
  Slack: { specific: [['Notification delays are affecting the team', 'Multiple team members report Slack notifications arriving several minutes after feedback is assigned.', 'Bug', 'High', 'NEW'], ['Teams need a clearer feedback status view', 'A product team asked for an easier way to see which customer issues are open, in progress, or closed.', 'Feature Request', 'Medium', 'REVIEWED']], source: 'Slack workspace conversation' },
  'Twitter/X': { specific: [['Customers are frustrated by slow support replies', 'Customers publicly mention waiting too long for a response after reporting an urgent problem.', 'Improvement', 'High', 'NEW'], ['Search results do not find older feedback', 'Users say the search experience misses feedback they know was created earlier in the month.', 'Bug', 'Medium', 'NEW']], source: 'Twitter/X post' },
};

const sharedFeedback = [
  ['Dashboard totals are hard to understand', 'A customer says the dashboard needs clearer labels so they can understand open and resolved feedback quickly.', 'Improvement', 'Medium', 'NEW'],
  ['Need an easier way to export feedback', 'A customer asked for a simple export so feedback can be shared with leadership during weekly reviews.', 'Feature Request', 'Low', 'NEW'],
  ['Mobile layout overlaps action buttons', 'A user reports that buttons overlap on a small mobile screen and prevent them from updating feedback.', 'Bug', 'Medium', 'NEW'],
  ['Feedback categories need more guidance', 'A customer was unsure whether their request should be reported as a bug, improvement, or feature request.', 'Improvement', 'Low', 'ACTIONED'],
  ['Assignment notifications are not visible enough', 'A team member missed a new assignment because the notification did not stand out in the interface.', 'Improvement', 'Medium', 'REVIEWED'],
  ['Loading feedback list is slow for large workspaces', 'A customer with many entries reports a noticeable delay before the feedback list becomes usable.', 'Performance', 'High', 'NEW'],
  ['Need better filtering by priority', 'A product manager wants to isolate high priority requests without manually reviewing every feedback item.', 'Feature Request', 'Medium', 'NEW'],
  ['Status changes are not obvious to customers', 'Customers say they are unsure when their submitted issue has moved from open to in progress.', 'Improvement', 'Medium', 'REVIEWED'],
  ['Invite flow needs clearer instructions', 'A workspace admin found it difficult to explain to colleagues how they should join the correct workspace.', 'Improvement', 'Low', 'ACTIONED'],
  ['Report generation should include more detail', 'A stakeholder requested more concrete examples in the customer report before sharing it with leadership.', 'Feature Request', 'Medium', 'NEW'],
  ['Repeated feedback should be easier to identify', 'Users want similar complaints grouped together so duplicate reports do not need to be reviewed one by one.', 'Feature Request', 'High', 'NEW'],
  ['Accessibility labels are missing in a few controls', 'A customer using a screen reader reports that some feedback action buttons have unclear labels.', 'Bug', 'High', 'NEW'],
  ['Customers appreciate the feedback tracking view', 'A customer says the clear feedback status and priority labels make it easier to follow product changes.', 'Other', 'Low', 'ACTIONED'],
  ['Attachments would help explain complex issues', 'A customer wants to add screenshots when reporting a visual issue so the team can reproduce it faster.', 'Feature Request', 'Medium', 'NEW'],
  ['Workspace navigation is confusing for new users', 'A new customer says they sometimes open the wrong workspace before creating or reviewing feedback.', 'Improvement', 'Medium', 'NEW'],
  ['Feedback form should save a draft', 'A customer lost a detailed submission after navigating away and requested automatic draft saving.', 'Feature Request', 'Medium', 'NEW'],
  ['Resolved issues should show the solution', 'A customer would like closed feedback to include a brief explanation of what was fixed.', 'Improvement', 'Low', 'REVIEWED'],
  ['Email alerts contain too little context', 'A customer says notification emails should include the feedback title, priority, and current status.', 'Improvement', 'Low', 'NEW'],
];

export function getSampleChannelFeedback(channel) {
  const profile = profiles[channel];
  if (!profile) return [];
  return [...profile.specific, ...sharedFeedback].map(([title, description, category, priority, status]) => ({
    title,
    description: `${description} This was submitted through the ${profile.source}.`,
    category: category === 'Performance' ? 'Improvement' : category,
    priority,
    status,
  }));
}
