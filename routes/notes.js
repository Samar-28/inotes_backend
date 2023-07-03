const express = require('express');
const router = express.Router();
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");
const fetchUser = require("../middleware/fetchUser");

// Get Notes
router.get('/fetchallnotes',fetchUser, async (req, res) => {
  try {
  const notes = await Notes.find({user:req.user.id});
  res.json(notes)
} catch (error) {
  return res.send({error:"Internal Server Error",success:false});   
}
  })

// add notes

router.post(
  "/addnotes",fetchUser,
  [
    body("title", "Enter a valid title").isLength({ min: 3,max: 50 }),
    body("description", "Enter a valid description").isLength({ min: 5 , max:120 })
  ],
  async (req, res) => {
    try {
    const {title,description,tag}=req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ error: errors.array(),success:false});
    }
    const note = new Notes({
      title,description,tag,user:req.user.id
    })
    const savedNote = await note.save()
    res.json({savedNote,success:true})
  } catch (error) {
    return res.send({error:[{msg:"Internal Server Error"}],success:false});   
  }
  });


// update notes
router.put(
  "/updatenotes/:id",fetchUser,[
      body('title', 'Enter a valid title').isLength({ min: 3 ,max:50}),
      body('description', 'Enter a valid valid description').isLength({ min: 5 ,max:120}),
  ],
  async (req, res) => {
    const errors =validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({error: errors.array(),success:false});
  }
    try {
    const {title,description,tag}=req.body;
    const newNote = {};
    if(title){newNote.title=title} 
    if(description){newNote.description=description} 
    if(tag){newNote.tag=tag}
    
    let note = await Notes.findById(req.params.id);
    if(!note){
      return res.send({error:[{msg:"Note Not Found"}],success:false});
    }
    if(note.user.toString() !==req.user.id){
      return res.send({error:[{msg:"Not allowed"}],success:false});
    }

    note = await Notes.findByIdAndUpdate(req.params.id,{$set: newNote},{new:true});

    res.json({note,success:true});


  } catch (error) {
      return res.send({error:[{msg:"Internal Server Error"}],success:false});   
  }
  });


// delete note


router.delete(
  "/deletenotes/:id",fetchUser,
  async (req, res) => {
    try {

    let note = await Notes.findById(req.params.id);
    if(!note){
      return res.send({error:"Note Not Found",success:false});
    }
    if(note.user.toString() !==req.user.id){
      return res.send({error:"Not allowed",success:false});
    }

    note = await Notes.findByIdAndDelete(req.params.id)

    res.json({success:true,note:note})

    } catch (error) {
        return res.send({error:"Internal Server Error",success:false});   
    }
    });



module.exports = router