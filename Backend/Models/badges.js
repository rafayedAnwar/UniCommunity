// Badge definitions and criteria for Sathi
// This can be imported wherever badge logic is needed

const BADGES = [
  {
    id: "initiate",
    name: "The Initiate",
    description: "Successfully create an account and log in for the first time.",
    criteria: "signup_first_login",
    category: "core"
  },
  {
    id: "whoami",
    name: "Who Am I?",
    description: "Fill out the Bio, upload a profile picture, and add one social link.",
    criteria: "profile_complete",
    category: "core"
  },
  {
    id: "hello_world",
    name: "Hello World",
    description: "Post your first comment or reply in any forum.",
    criteria: "first_forum_post",
    category: "core"
  },
  {
    id: "curious_mind",
    name: "Curious Mind",
    description: "Download or view your first study material from the Resource Forum.",
    criteria: "first_resource_view",
    category: "core"
  },
  {
    id: "streaker",
    name: "Streaker",
    description: "Log in for 3 consecutive days.",
    criteria: "login_streak_3",
    category: "core"
  },
  // Less hassle badges
  {
    id: "magna_cum_laude",
    name: "Magna Cum Laude",
    description: "Maintain a CGPA of 3.7 or higher in the private calculator.",
    criteria: "cgpa_3_7_plus",
    category: "achievement"
  },
  {
    id: "note_god",
    name: "The Note God",
    description: "Your uploaded notes/slides receive 50+ downloads.",
    criteria: "notes_50_downloads",
    category: "achievement"
  },
  {
    id: "syllabus_crusher",
    name: "Syllabus Crusher",
    description: "Check off 100% of the items in your Course Checklist before finals week.",
    criteria: "checklist_100_before_finals",
    category: "achievement"
  },
  {
    id: "ta_material",
    name: "The TA Material",
    description: "Receive the 'Most Helpful' tag on 10 different forum answers.",
    criteria: "helpful_10_forum_answers",
    category: "achievement"
  },
  {
    id: "c_is_for_degree",
    name: "C is for Degree",
    description: "Maintain a CGPA between 2.0 and 2.5 for two consecutive semesters.",
    criteria: "cgpa_2_0_2_5_two_semesters",
    category: "vibes"
  },
  {
    id: "last_minute_legend",
    name: "Last Minute Legend",
    description: "Download a resource file less than 1 hour before a scheduled exam event.",
    criteria: "resource_before_exam",
    category: "vibes"
  },
  {
    id: "night_owl",
    name: "Night Owl",
    description: "Be active (post/comment) between 3:00 AM and 5:00 AM.",
    criteria: "active_3_5am",
    category: "vibes"
  },
  {
    id: "lurker",
    name: "The Lurker",
    description: "View 100 threads without posting a single comment.",
    criteria: "view_100_threads_no_post",
    category: "vibes"
  },
  {
    id: "social_butterfly",
    name: "Social Butterfly",
    description: "RSVP 'Going' to 10 Social Events but 0 Academic Workshops.",
    criteria: "10_social_0_academic",
    category: "vibes"
  }
];

module.exports = BADGES;
