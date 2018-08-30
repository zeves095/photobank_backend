/**
 * Функция для валидации форм
 * @param  {Object} formData Данные формы
 * @param  {string[]} errors Ошибки валидации
 */
export function validateLinkAddForm(formData, errors){

  let min_width = 32;
  let max_width = 4096;
  let min_height = 32;
  let max_height = 2160;
  let min_width_height_ratio = 1;
  let max_width_height_ratio = 2.3;

  if(typeof formData.size.width !== undefined){
    if(formData.size.width <= 0){
      errors.size.width.addError("Ширина не может быть отрицательным значением");
    }else{
      if(formData.size.width < min_width){
        errors.size.width.addError("Ширина картинки должна быть больше "+min_width);
      }else if(formData.size.width > max_width){
        errors.size.width.addError("Ширина картинки должна быть меньше "+max_width);
      }
    }
  }

  if(typeof formData.size.height !== undefined){
    if(formData.size.height <= 0){
      errors.size.height.addError("Высота не может быть отрицательным значением");
    }else{
      if(formData.size.height < min_height){
        errors.size.height.addError("Высота картинки должна быть больше "+min_height);
      }else if(formData.size.height > max_height){
        errors.size.height.addError("Высота картинки должна быть меньше "+max_height);
      }
    }
  }

  if(
    typeof formData.size.width !== undefined
    && typeof formData.size.height !== undefined
    && formData.size.width > 0
    && formData.size.height > 0
  ){
    let minWidth = Math.ceil(formData.size.height*min_width_height_ratio);
    let maxHeight = Math.floor(formData.size.width/min_width_height_ratio);
    let maxWidth = Math.floor(formData.size.height*max_width_height_ratio);
    let minHeight = Math.ceil(formData.size.width/max_width_height_ratio);
    if(formData.size.width/formData.size.height<min_width_height_ratio){
      minWidth<=max_width&&errors.size.width.addError("Ширина не может быть меньше " + minWidth + " при высоте "+formData.size.height);
      maxHeight>=min_height&&errors.size.height.addError("Высота не может привышать " + maxHeight + " при ширине "+formData.size.width);
    }else if(formData.size.width/formData.size.height>max_width_height_ratio){
      maxWidth>=min_width&&errors.size.width.addError("Ширина не может привышать " + maxWidth + " при высоте "+formData.size.height);
      minHeight<=max_height&&errors.size.height.addError("Высота не может быть меньше " + minHeight + " при ширине "+formData.size.width);
    }

  }

  return errors;
}
