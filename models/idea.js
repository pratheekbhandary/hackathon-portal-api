class Idea {
  constructor(email, token) {
    this.author = {
      email,
      token,
      firstName: "",
      lastName: "",
      mobile: "",
      alternate: "",
      manager: ""
    };
    this.teamMembers = [email];
    this.teamName = "";
    this.submittedDate = "";
    this.status = "";
    this.framework = "";
    this.nominationTitle = "";
    this.description = "";
    this.ideaDocument = "";
    this.ideaSubmitted = false;
    this.reviews = [];
  }

  static create(email, token) {
    const idea = new Idea(email, token);
    return idea.value;
  }

  get value() {
    return {
      author: this.author,
      teamMembers: this.teamMembers,
      teamName: this.teamName,
      submittedDate: this.submittedDate,
      status: this.status,
      framework: this.framework,
      nominationTitle: this.nominationTitle,
      description: this.description,
      ideaDocument: this.ideaDocument,
      ideaSubmitted: this.ideaSubmitted,
      reviews: this.reviews
    };
  }
}

module.exports = { Idea };
