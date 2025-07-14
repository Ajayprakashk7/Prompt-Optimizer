// Real-Time Collaboration Service
// Revolutionary team collaboration and sharing capabilities

export interface CollaborativePrompt {
  id: string;
  title: string;
  content: string;
  ownerId: string;
  teamId?: string;
  
  // Collaboration metadata
  collaborators: Collaborator[];
  permissions: PromptPermissions;
  version: number;
  lastModified: Date;
  
  // Real-time editing
  activeEditors: ActiveEditor[];
  changeHistory: PromptChange[];
  
  // Sharing and visibility
  visibility: 'private' | 'team' | 'organization' | 'public';
  shareLink?: string;
  tags: string[];
  
  // Quality and feedback
  qualityScore: number;
  reviews: PromptReview[];
  ratings: PromptRating[];
}

export interface Collaborator {
  userId: string;
  username: string;
  role: 'viewer' | 'editor' | 'admin' | 'owner';
  joinedAt: Date;
  lastActive: Date;
  contributions: number;
}

export interface PromptPermissions {
  canView: string[]; // User IDs
  canEdit: string[]; // User IDs
  canComment: string[]; // User IDs
  canShare: string[]; // User IDs
  canDelete: string[]; // User IDs
}

export interface ActiveEditor {
  userId: string;
  username: string;
  cursorPosition: number;
  selection: { start: number; end: number } | null;
  lastActivity: Date;
  color: string; // For visual indication
}

export interface PromptChange {
  id: string;
  userId: string;
  username: string;
  timestamp: Date;
  type: 'insert' | 'delete' | 'replace' | 'format';
  position: number;
  oldContent: string;
  newContent: string;
  description: string;
}

export interface PromptReview {
  id: string;
  reviewerId: string;
  reviewerName: string;
  timestamp: Date;
  type: 'approval' | 'suggestion' | 'concern' | 'question';
  content: string;
  position?: number; // Position in prompt for inline comments
  resolved: boolean;
  responses: ReviewResponse[];
}

export interface ReviewResponse {
  id: string;
  userId: string;
  username: string;
  timestamp: Date;
  content: string;
}

export interface PromptRating {
  userId: string;
  rating: number; // 1-5 stars
  timestamp: Date;
  comment?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: TeamMember[];
  settings: TeamSettings;
  createdAt: Date;
  promptCount: number;
  totalCollaborations: number;
}

export interface TeamMember {
  userId: string;
  username: string;
  email: string;
  role: 'member' | 'admin' | 'owner';
  joinedAt: Date;
  lastActive: Date;
  contributionScore: number;
}

export interface TeamSettings {
  defaultPromptVisibility: 'private' | 'team' | 'organization';
  requireReviewForPublish: boolean;
  allowExternalSharing: boolean;
  qualityThreshold: number;
  notificationPreferences: NotificationSettings;
}

export interface NotificationSettings {
  promptShared: boolean;
  commentAdded: boolean;
  reviewRequested: boolean;
  qualityScoreChanged: boolean;
  teamInvitation: boolean;
}

export interface CollaborationSession {
  promptId: string;
  participants: ActiveEditor[];
  startTime: Date;
  lastActivity: Date;
  changeCount: number;
  qualityImprovement: number;
}

export class CollaborationService {
  private static instance: CollaborationService;
  private collaborativePrompts = new Map<string, CollaborativePrompt>();
  private teams = new Map<string, Team>();
  private activeSessions = new Map<string, CollaborationSession>();
  private websocketConnections = new Map<string, WebSocket>();

  static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  // Prompt collaboration methods
  async createCollaborativePrompt(
    title: string,
    content: string,
    ownerId: string,
    teamId?: string
  ): Promise<CollaborativePrompt> {
    const prompt: CollaborativePrompt = {
      id: this.generatePromptId(),
      title,
      content,
      ownerId,
      teamId,
      collaborators: [{
        userId: ownerId,
        username: 'Owner', // Would be fetched from user service
        role: 'owner',
        joinedAt: new Date(),
        lastActive: new Date(),
        contributions: 1
      }],
      permissions: {
        canView: [ownerId],
        canEdit: [ownerId],
        canComment: [ownerId],
        canShare: [ownerId],
        canDelete: [ownerId]
      },
      version: 1,
      lastModified: new Date(),
      activeEditors: [],
      changeHistory: [],
      visibility: 'private',
      tags: [],
      qualityScore: 0,
      reviews: [],
      ratings: []
    };

    this.collaborativePrompts.set(prompt.id, prompt);
    return prompt;
  }

  async sharePrompt(
    promptId: string,
    userId: string,
    shareWith: string[],
    permissions: Partial<PromptPermissions>
  ): Promise<void> {
    const prompt = this.collaborativePrompts.get(promptId);
    if (!prompt) throw new Error('Prompt not found');

    // Check if user has sharing permissions
    if (!prompt.permissions.canShare.includes(userId)) {
      throw new Error('Insufficient permissions to share');
    }

    // Add new collaborators
    for (const targetUserId of shareWith) {
      if (!prompt.collaborators.find(c => c.userId === targetUserId)) {
        prompt.collaborators.push({
          userId: targetUserId,
          username: `User_${targetUserId}`, // Would be fetched from user service
          role: 'editor',
          joinedAt: new Date(),
          lastActive: new Date(),
          contributions: 0
        });
      }

      // Update permissions
      if (permissions.canView) prompt.permissions.canView.push(targetUserId);
      if (permissions.canEdit) prompt.permissions.canEdit.push(targetUserId);
      if (permissions.canComment) prompt.permissions.canComment.push(targetUserId);
    }

    prompt.lastModified = new Date();
    await this.notifyCollaborators(promptId, 'prompt_shared', { sharedBy: userId, newCollaborators: shareWith });
  }

  // Real-time editing
  async joinEditingSession(promptId: string, userId: string): Promise<CollaborationSession> {
    const prompt = this.collaborativePrompts.get(promptId);
    if (!prompt) throw new Error('Prompt not found');

    if (!prompt.permissions.canEdit.includes(userId)) {
      throw new Error('No edit permissions');
    }

    // Add to active editors
    const editor: ActiveEditor = {
      userId,
      username: `User_${userId}`,
      cursorPosition: 0,
      selection: null,
      lastActivity: new Date(),
      color: this.generateUserColor(userId)
    };

    prompt.activeEditors.push(editor);

    // Create or update session
    let session = this.activeSessions.get(promptId);
    if (!session) {
      session = {
        promptId,
        participants: [editor],
        startTime: new Date(),
        lastActivity: new Date(),
        changeCount: 0,
        qualityImprovement: 0
      };
      this.activeSessions.set(promptId, session);
    } else {
      session.participants.push(editor);
      session.lastActivity = new Date();
    }

    // Notify other editors
    await this.broadcastToEditors(promptId, 'user_joined', { user: editor });

    return session;
  }

  async updatePromptContent(
    promptId: string,
    userId: string,
    newContent: string,
    change: Omit<PromptChange, 'id' | 'userId' | 'username' | 'timestamp'>
  ): Promise<void> {
    const prompt = this.collaborativePrompts.get(promptId);
    if (!prompt) throw new Error('Prompt not found');

    if (!prompt.permissions.canEdit.includes(userId)) {
      throw new Error('No edit permissions');
    }

    // Record change
    const promptChange: PromptChange = {
      id: this.generateChangeId(),
      userId,
      username: `User_${userId}`,
      timestamp: new Date(),
      ...change
    };

    prompt.changeHistory.push(promptChange);
    prompt.content = newContent;
    prompt.version++;
    prompt.lastModified = new Date();

    // Update session
    const session = this.activeSessions.get(promptId);
    if (session) {
      session.changeCount++;
      session.lastActivity = new Date();
    }

    // Broadcast change to other editors
    await this.broadcastToEditors(promptId, 'content_changed', {
      change: promptChange,
      newContent,
      version: prompt.version
    });

    // Update contributor stats
    const collaborator = prompt.collaborators.find(c => c.userId === userId);
    if (collaborator) {
      collaborator.contributions++;
      collaborator.lastActive = new Date();
    }
  }

  async updateCursorPosition(
    promptId: string,
    userId: string,
    position: number,
    selection?: { start: number; end: number }
  ): Promise<void> {
    const prompt = this.collaborativePrompts.get(promptId);
    if (!prompt) return;

    const editor = prompt.activeEditors.find(e => e.userId === userId);
    if (editor) {
      editor.cursorPosition = position;
      editor.selection = selection || null;
      editor.lastActivity = new Date();

      // Broadcast cursor update
      await this.broadcastToEditors(promptId, 'cursor_moved', {
        userId,
        position,
        selection
      });
    }
  }

  // Review and feedback system
  async addReview(
    promptId: string,
    reviewerId: string,
    review: Omit<PromptReview, 'id' | 'reviewerId' | 'reviewerName' | 'timestamp' | 'resolved' | 'responses'>
  ): Promise<PromptReview> {
    const prompt = this.collaborativePrompts.get(promptId);
    if (!prompt) throw new Error('Prompt not found');

    if (!prompt.permissions.canComment.includes(reviewerId)) {
      throw new Error('No comment permissions');
    }

    const newReview: PromptReview = {
      id: this.generateReviewId(),
      reviewerId,
      reviewerName: `User_${reviewerId}`,
      timestamp: new Date(),
      resolved: false,
      responses: [],
      ...review
    };

    prompt.reviews.push(newReview);
    prompt.lastModified = new Date();

    // Notify collaborators
    await this.notifyCollaborators(promptId, 'review_added', { review: newReview });

    return newReview;
  }

  async ratePrompt(
    promptId: string,
    userId: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    const prompt = this.collaborativePrompts.get(promptId);
    if (!prompt) throw new Error('Prompt not found');

    // Remove existing rating from this user
    prompt.ratings = prompt.ratings.filter(r => r.userId !== userId);

    // Add new rating
    prompt.ratings.push({
      userId,
      rating,
      timestamp: new Date(),
      comment
    });

    // Recalculate average rating
    const avgRating = prompt.ratings.reduce((sum, r) => sum + r.rating, 0) / prompt.ratings.length;
    prompt.qualityScore = avgRating * 20; // Convert to 0-100 scale

    prompt.lastModified = new Date();
  }

  // Team management
  async createTeam(
    name: string,
    description: string,
    ownerId: string,
    settings?: Partial<TeamSettings>
  ): Promise<Team> {
    const team: Team = {
      id: this.generateTeamId(),
      name,
      description,
      ownerId,
      members: [{
        userId: ownerId,
        username: `User_${ownerId}`,
        email: `user${ownerId}@example.com`,
        role: 'owner',
        joinedAt: new Date(),
        lastActive: new Date(),
        contributionScore: 0
      }],
      settings: {
        defaultPromptVisibility: 'team',
        requireReviewForPublish: false,
        allowExternalSharing: true,
        qualityThreshold: 70,
        notificationPreferences: {
          promptShared: true,
          commentAdded: true,
          reviewRequested: true,
          qualityScoreChanged: false,
          teamInvitation: true
        },
        ...settings
      },
      createdAt: new Date(),
      promptCount: 0,
      totalCollaborations: 0
    };

    this.teams.set(team.id, team);
    return team;
  }

  async inviteToTeam(
    teamId: string,
    inviterId: string,
    userIds: string[],
    role: 'member' | 'admin' = 'member'
  ): Promise<void> {
    const team = this.teams.get(teamId);
    if (!team) throw new Error('Team not found');

    const inviter = team.members.find(m => m.userId === inviterId);
    if (!inviter || (inviter.role !== 'admin' && inviter.role !== 'owner')) {
      throw new Error('Insufficient permissions to invite');
    }

    for (const userId of userIds) {
      if (!team.members.find(m => m.userId === userId)) {
        team.members.push({
          userId,
          username: `User_${userId}`,
          email: `user${userId}@example.com`,
          role,
          joinedAt: new Date(),
          lastActive: new Date(),
          contributionScore: 0
        });
      }
    }

    // Send notifications
    await this.notifyUsers(userIds, 'team_invitation', { team, inviter: inviterId });
  }

  // Analytics and insights
  async getCollaborationAnalytics(promptId: string): Promise<CollaborationAnalytics> {
    const prompt = this.collaborativePrompts.get(promptId);
    if (!prompt) throw new Error('Prompt not found');

    const totalChanges = prompt.changeHistory.length;
    const uniqueContributors = new Set(prompt.changeHistory.map(c => c.userId)).size;
    const avgResponseTime = this.calculateAverageResponseTime(prompt.changeHistory);
    const qualityProgression = this.calculateQualityProgression(prompt);

    return {
      promptId,
      totalCollaborators: prompt.collaborators.length,
      totalChanges,
      uniqueContributors,
      averageResponseTime: avgResponseTime,
      qualityProgression,
      mostActiveContributor: this.getMostActiveContributor(prompt),
      collaborationScore: this.calculateCollaborationScore(prompt),
      insights: this.generateCollaborationInsights(prompt)
    };
  }

  // Private helper methods
  private async broadcastToEditors(promptId: string, event: string, data: any): Promise<void> {
    const prompt = this.collaborativePrompts.get(promptId);
    if (!prompt) return;

    for (const editor of prompt.activeEditors) {
      const connection = this.websocketConnections.get(editor.userId);
      if (connection && connection.readyState === WebSocket.OPEN) {
        connection.send(JSON.stringify({ event, data, promptId }));
      }
    }
  }

  private async notifyCollaborators(promptId: string, event: string, data: any): Promise<void> {
    const prompt = this.collaborativePrompts.get(promptId);
    if (!prompt) return;

    const userIds = prompt.collaborators.map(c => c.userId);
    await this.notifyUsers(userIds, event, { ...data, promptId });
  }

  private async notifyUsers(userIds: string[], event: string, data: any): Promise<void> {
    // Implementation would send notifications via email, push, etc.
    console.log(`Notifying users ${userIds.join(', ')} about ${event}:`, data);
  }

  private generateUserColor(userId: string): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const index = parseInt(userId.slice(-2), 16) % colors.length;
    return colors[index];
  }

  private calculateAverageResponseTime(changes: PromptChange[]): number {
    if (changes.length < 2) return 0;
    
    let totalTime = 0;
    for (let i = 1; i < changes.length; i++) {
      const timeDiff = changes[i].timestamp.getTime() - changes[i-1].timestamp.getTime();
      totalTime += timeDiff;
    }
    
    return totalTime / (changes.length - 1);
  }

  private calculateQualityProgression(prompt: CollaborativePrompt): number[] {
    // Simulate quality progression over time
    return prompt.changeHistory.map((_, index) => 50 + (index * 2) + Math.random() * 10);
  }

  private getMostActiveContributor(prompt: CollaborativePrompt): string {
    return prompt.collaborators
      .sort((a, b) => b.contributions - a.contributions)[0]?.userId || '';
  }

  private calculateCollaborationScore(prompt: CollaborativePrompt): number {
    const factors = {
      collaboratorCount: Math.min(prompt.collaborators.length * 10, 30),
      changeFrequency: Math.min(prompt.changeHistory.length * 2, 40),
      reviewEngagement: Math.min(prompt.reviews.length * 5, 20),
      qualityScore: prompt.qualityScore * 0.1
    };
    
    return Object.values(factors).reduce((sum, value) => sum + value, 0);
  }

  private generateCollaborationInsights(prompt: CollaborativePrompt): string[] {
    const insights: string[] = [];
    
    if (prompt.collaborators.length > 5) {
      insights.push('High collaboration engagement with diverse contributor base');
    }
    
    if (prompt.changeHistory.length > 20) {
      insights.push('Iterative improvement pattern indicates thorough refinement');
    }
    
    if (prompt.reviews.length > 3) {
      insights.push('Strong peer review culture enhances quality assurance');
    }
    
    return insights;
  }

  // ID generators
  private generatePromptId(): string {
    return `collab_prompt_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  private generateChangeId(): string {
    return `change_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private generateReviewId(): string {
    return `review_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private generateTeamId(): string {
    return `team_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  // Public API methods
  getCollaborativePrompt(promptId: string): CollaborativePrompt | undefined {
    return this.collaborativePrompts.get(promptId);
  }

  getUserPrompts(userId: string): CollaborativePrompt[] {
    return Array.from(this.collaborativePrompts.values())
      .filter(p => p.permissions.canView.includes(userId));
  }

  getTeam(teamId: string): Team | undefined {
    return this.teams.get(teamId);
  }

  getUserTeams(userId: string): Team[] {
    return Array.from(this.teams.values())
      .filter(t => t.members.some(m => m.userId === userId));
  }
}

// Supporting interfaces
interface CollaborationAnalytics {
  promptId: string;
  totalCollaborators: number;
  totalChanges: number;
  uniqueContributors: number;
  averageResponseTime: number;
  qualityProgression: number[];
  mostActiveContributor: string;
  collaborationScore: number;
  insights: string[];
}

// Export singleton instance
export const collaborationService = CollaborationService.getInstance();
