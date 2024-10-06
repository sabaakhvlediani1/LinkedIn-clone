import {mailtrapClient,sender} from "../lib/mailtrap.js"
import { createCommentNotificationEmailTemplate, createWelcomeEmailTemplate } from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name, profileUrl) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from:sender,
            to:recipient,
            subject:"Welcome to UnLinked",
            html:createWelcomeEmailTemplate(name,profileUrl),
            category:"welcome"
        })
        console.log("Welcome Email sent sucessfully", response);
        
    } catch (error) {
        throw error;
    }
}

export const sendCommentNotificationEmail = async(
    recpientEmail,
    recipientName,
    commenterName,
    postUrl,
    commentContent
) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from:sender,
            to:recipient,
            subject:"New Comment on your post",
            html:createCommentNotificationEmailTemplate(
                recipientName,
                commenterName,
                postUrl,
                commentContent
            ),
            category:"comment_Notification"
        })
        console.log("Comment Notification Email sent sucessfully", response);
        
    } catch (error) {
        throw error;
    }
}