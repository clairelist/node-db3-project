const lego = require('../../data/db-config.js');

async function find() { // EXERCISE A
  /*
    1A- Study the SQL query below running it in SQLite Studio against `data/schemes.db3`.
    What happens if we change from a LEFT join to an INNER join?
      --> we lose the 'have fun!' plot, which only has (0) steps !

      SELECT
          sc.*, <------ apparently aliasing can be retroactive lol
          count(st.step_id) AS number_of_steps <-- incrementing by step id
      FROM schemes AS sc
      LEFT JOIN steps AS st <-- will include ALL schemes, regardless of if matching entry in steps table
          ON sc.scheme_id = st.scheme_id
      GROUP BY sc.scheme_id
      ORDER BY sc.scheme_id ASC;

    2A- When you have a grasp on the query go ahead and build it in Knex.
    Return from this function the resulting dataset.
  */
 const dataset = await lego('schemes AS sc')
                           .select('sc.*')
                           .count('st.step_id AS number_of_steps')
                           .leftJoin('steps AS st','sc.scheme_id','st.scheme_id')
                           .groupBy('sc.scheme_id')
                           .orderBy('sc.scheme_id','ASC');
      return dataset;
}

async function findById(scheme_id) { // EXERCISE B
  /*
    1B- Study the SQL query below running it in SQLite Studio against `data/schemes.db3`:

      SELECT
          sc.scheme_name,
          st.*
      FROM schemes AS sc
      LEFT JOIN steps AS st
          ON sc.scheme_id = st.scheme_id
      WHERE sc.scheme_id = 1
      ORDER BY st.step_number ASC;

    2B- When you have a grasp on the query go ahead and build it in Knex
    making it parametric: instead of a literal `1` you should use `scheme_id`.

    3B- Test in Postman and see that the resulting data does not look like a scheme,
    but more like an array of steps each including scheme information:

      [
        {
          "scheme_id": 1,
          "scheme_name": "World Domination",
          "step_id": 2,
          "step_number": 1,
          "instructions": "solve prime number theory"
        },
        {
          "scheme_id": 1,
          "scheme_name": "World Domination",
          "step_id": 1,
          "step_number": 2,
          "instructions": "crack cyber security"
        },
        // etc
      ]

    4B- Using the array obtained and vanilla JavaScript, create an object with
    the structure below, for the case _when steps exist_ for a given `scheme_id`:

      {
        "scheme_id": 1,
        "scheme_name": "World Domination",
        "steps": [
          {
            "step_id": 2,
            "step_number": 1,
            "instructions": "solve prime number theory"
          },
          {
            "step_id": 1,
            "step_number": 2,
            "instructions": "crack cyber security"
          },
          // etc
        ]
      }

    5B- This is what the result should look like _if there are no steps_ for a `scheme_id`:

      {
        "scheme_id": 7,
        "scheme_name": "Have Fun!",
        "steps": []
      }
  */
  //     SELECT
  //     sc.scheme_name,
  //     st.*
  // FROM schemes AS sc
  // LEFT JOIN steps AS st
  //     ON sc.scheme_id = st.scheme_id
  // WHERE sc.scheme_id = ? --> scheme_id var ##
  // ORDER BY st.step_number ASC;
  const rows = await lego('schemes AS sc')
                        .select('sc.scheme_name','st.*')
                        .leftJoin('steps AS st','sc.scheme_id','st.scheme_id')
                        .where(`sc.scheme_id`,scheme_id)
                        .orderBy('st.step_number','ASC');
      
      const resultr = {
        scheme_id: rows[0].scheme_id,
        scheme_name: rows[0].scheme_name,
        steps: rows.reduce((steps,step)=>{
            if (!step.step_id) return steps;
          return steps.concat({step_id:step.step_id,
            step_number:step.step_number,
            instructions:step.instructions})
        },[])
      }
    return resultr;
}

async function findSteps(scheme_id) { // EXERCISE C
  /*
    1C- Build a query in Knex that returns the following data.
    The steps should be sorted by step_number, and the array
    should be empty if there are no steps for the scheme:
SELECT
step_id, step_number, instructions, scheme_name
FROM schemes AS sc
LEFT JOIN steps AS st
    ON sc.scheme_id = st.scheme_id
WHERE sc.scheme_id = 6
ORDER BY step_number;
      [
        {
          "step_id": 5,
          "step_number": 1,
          "instructions": "collect all the sheep in Scotland",
          "scheme_name": "Get Rich Quick"
        },
        {
          "step_id": 4,
          "step_number": 2,
          "instructions": "profit",
          "scheme_name": "Get Rich Quick"
        }
      ]
      SELECT
step_id, step_number, instructions, scheme_name
FROM schemes AS sc
LEFT JOIN steps AS st
    ON sc.scheme_id = st.scheme_id
WHERE sc.scheme_id = ?
ORDER BY step_number;
  */
      const findr = await lego('schemes as sc')
      .leftJoin('steps as st', 'sc.scheme_id','st.scheme_id')
      .select('st.step_id','st.step_number','instructions','sc.scheme_name')
      .where('sc.scheme_id',scheme_id)
      .orderBy('step_number');

      if (!findr[0].step_id) return [];
      return findr;
}

function add(scheme) { // EXERCISE D
  /*
    1D- This function creates a new scheme and resolves to _the newly created scheme_. EASY
  */

    return lego('schemes').insert(scheme)
      .then(([id]) => {
        return lego('schemes').where('scheme_id',id).first(); //NOT an array ! first method fixes this
      })
}

function addStep(scheme_id, step) { // EXERCISE E
  /*
    1E- This function adds a step to the scheme with the given `scheme_id`
    and resolves to _all the steps_ belonging to the given `scheme_id`,
    including the newly created one.
  */
 return lego('steps').insert({
   ...step,
   scheme_id
 }).then(()=>{
   return lego('steps').where('scheme_id',scheme_id).orderBy('step_number','asc');
 })
}

module.exports = {
  find,
  findById,
  findSteps,
  add,
  addStep,
}
