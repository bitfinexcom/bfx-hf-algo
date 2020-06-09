'use strict'

/**
 * Object describing the layout and components of the submission form presented
 * to the user for an individual algorithmic order. For examples, refer to any
 * of the algorithmic orders provided by {@link module:bfx-hf-algo|bfx-hf-algo}
 *
 * @typedef {object} AOUIDefinition
 * @property {string} label - name of the order to be shown to the user
 * @property {string} id - internal algorithmic order ID
 * @property {string} [uiIcon] - CSS classname of the icon to show
 * @property {string} [customHelp] - documentation
 * @property {number} connectionTimeout - how long to wait before considering
 *   the HF disconnected
 * @property {number} actionTimeout - how long to wait for action confirmatio
 *   before considering the HF disconnected
 * @property {object} [header] - rendered at the top of the form
 * @property {string} [header.component] - component to use for the header
 * @property {string[]} [header.fields] - array of field names to render in
 *   header
 * @property {object[]} sections - the layout definition itself
 * @property {string} sections[].title - rendered above the section
 * @property {string} sections[].name - unique internal ID for the section
 * @property {string[][]} sections[].rows - array of rows of field IDs to
 *   render in the section, two per row.
 * @property {object} fields - field definitions, key'd by ID
 * @property {string[]} actions - array of action names, maximum 2
 */
