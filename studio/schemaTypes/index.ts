import {article} from './article'
import {bodyRegion} from './bodyRegion'
import {equipment} from './equipment'
import {equipmentCategory} from './equipmentCategory'
import {exercise} from './exercise'
import {muscle} from './muscle'
import {person} from './person'
import {program} from './program'
import {testimonial} from './testimonial'
import {workout} from './workout'

export const schemaTypes = [
  // Core training model
  program,
  workout,
  exercise,
  // Supporting reference data
  muscle,
  equipment,
  // Taxonomies
  bodyRegion,
  equipmentCategory,
  // Editorial
  person,
  article,
  testimonial,
]
