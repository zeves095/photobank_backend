import { LinkAddFormSchema } from '../../forms/schema';

export default function validateLinkAddForm(formData){

  let response = [false, ""];

  let min_width = 32;
  let max_width = 4096;
  let min_height = 32;
  let max_height = 2160;
  let min_width_height_ratio = 1;
  let max_width_height_ratio = 2.3;

  if(formData.size.width < min_width){
    response = [true, ""];
  }

  return response;
}
