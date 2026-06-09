export class UserNotFoundError extends Error {
  constructor(message: string = "User not found") {
    super(message);
    this.name = "UserNotFoundError";
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
}

export class GitHubRateLimitError extends Error {
  constructor(
    message: string = "GitHub API rate limit exceeded",
    public readonly resetTime?: Date,
  ) {
    super(message);
    this.name = "GitHubRateLimitError";
    Object.setPrototypeOf(this, GitHubRateLimitError.prototype);
  }
}

export class AnalysisFailedError extends Error {
  constructor(
    message: string = "Code analysis failed",
    public readonly details?: string,
  ) {
    super(message);
    this.name = "AnalysisFailedError";
    Object.setPrototypeOf(this, AnalysisFailedError.prototype);
  }
}
