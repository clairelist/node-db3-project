/*
  If `scheme_id` does not exist in the database:

  status 404
  {
    "message": "scheme with scheme_id <actual id> not found"
  }
*/

const db = require('../../data/db-config.js');

const checkSchemeId = async (req, res, next) => {
  try{
    const scheme = await db('schemes').where('scheme_id', req.params.scheme_id).first();
    if(!scheme){
      next({ message: `scheme with scheme_id ${req.params.scheme_id} not found`, status: 404 })
    } else {
      next(); //DONT FORGET ABOUT ME !
    }
  } catch(err){
    next(err);
  }
}

/*
  If `scheme_name` is missing, empty string or not a string:

  status 400
  {
    "message": "invalid scheme_name"
  }
*/
const validateScheme = (req, res, next) => {
  //some magic ! from project video

  if(
    req.body.scheme_name === undefined ||
    typeof req.body.scheme_name !== 'string' ||
    !req.body.scheme_name.trim()
  ){
    const error = {status: 400, message: "invalid scheme_name"}
    next(error);
  } else {
    next();
  }

}

/*
  If `instructions` is missing, empty string or not a string, or
  if `step_number` is not a number or is smaller than one:

  status 400
  {
    "message": "invalid step"
  }
*/
const validateStep = (req, res, next) => {
  const { instructions, step_number } = req.body;

  if (
    instructions === undefined ||
    typeof instructions !== 'string' ||
    !instructions.trim() ||
    typeof step_number !== 'number' ||
    step_number < 1
  ) {
    const error = {status: 400, message: 'invalid step'}
    next(error);
  } else {
    next();
  }
}

module.exports = {
  checkSchemeId,
  validateScheme,
  validateStep,
}
