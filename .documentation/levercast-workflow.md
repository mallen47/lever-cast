The app we are working on is called LeverCast. Its main value proposition is that it helps users quickly capture and share their ideas to various social media platforms with a single post submission. The LeverCast app's templates feature provides a way for users to categorize customized prompts by topic for various social media platforms. The 'prompt' is the instructions for an LLM to use when composing a social media post based on the user's content idea. 

### End-to-end workflow: 
* User has idea they want to share to various social media platforms
* User selects option to create new post
* User selects a template that best matches the topic idea he wants to share. If the template doesn't exist, he can create one.
* On the edit-post page, user enters content idea which may optionally include an image, then selects the social media platforms he wishes to publish to. Here the options for social media platforms are preselected because they are specified by the template, but the user can override them if he wishes.
* Upon clicking the 'Publish' button, the levercast app must prepare the submission data to send to OpenAI via API request. This means the request payload will included the form data for the post (including image if one is provided), along with the template prompts for each of the specified social media platforms. 
* LeverCast sends the request data to OpenAI API and waits for its asynchronous response.
* Upon receiving a valid response from OpenAI, LeverCast processes the response data and updates the Post Previews with the LLM generated post content.
