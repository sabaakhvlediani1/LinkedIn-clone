import { sendCommentNotificationEmail } from "../emails/emailHandlers.js";
import cloudinary from "../lib/cloudinary.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: { $in: req.user.connections } })
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getFeedPosts", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    let newPost;

    if (image) {
      const imgResult = await cloudinary.uploader.upload(image);
      newPost = new Post({
        author: req.user._id,
        content,
        image: imgResult.secure_url,
      });
    } else {
      newPost = new Post({
        author: req.user._id,
        content,
      });
    }

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in createPost", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params._id;
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    // check if the current user is the author of the post
    if (post.author.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }

    //delete the image from cloudinary as well
    if (post.image) {
      await cloudinary.uploader.destroy(
        post.image.split("/").pop().split(".")[0]
      );
    }
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in deletePost", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const postId = req.params._id;
    const post = await Post.findById(postId)
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture username headline");

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in getpostById", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createComment = async (req, res) => {
  try {
    const postId = req.params._id;
    const { content } = req.body;

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            user: req.user._id,
            content,
          },
        },
      },
      { new: true }
    ).populate("author", "name email username profilePicture");

    // create a notification if the comment owner is not the post owner
    if(post.author.toString() !== req.user._id.toString()) {
        const newNotification = new Notification({
            recipient: post.author,
            type: "comment",
            relatedUser: req.user._id,
            relatedPost: postId
        })

        await newNotification.save();
        try {
            const postUrl = process.env.CLIENT_URL + "/post/" + postId;
            await sendCommentNotificationEmail(post.author.email, post.author.name,req.user.name,postUrl,content)

        } catch (error) {
            console.log("Error in sending comment notification email",error.message)
        }
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in createComment", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
