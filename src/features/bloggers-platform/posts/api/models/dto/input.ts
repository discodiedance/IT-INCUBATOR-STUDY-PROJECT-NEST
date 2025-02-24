import { Validate } from 'class-validator';
import { IsStringWithTrim } from '../../../../../../core/decorators/validation/is-string-with-trim.decorator';
import {
  postTitleConstraints,
  postShortDescriptionConstraints,
  postContentConstraints,
} from '../../../constants/validation-constants';
import { BlogExistsValidator } from '../../../../../../core/decorators/validation/is-blog-exists.validator';

export class InputCreatePostDataType {
  @IsStringWithTrim(1, postTitleConstraints.maxLength)
  public title: string;
  @IsStringWithTrim(1, postShortDescriptionConstraints.maxLength)
  public shortDescription: string;
  @IsStringWithTrim(1, postContentConstraints.maxLength)
  public content: string;
  @Validate(BlogExistsValidator)
  public blogId: string;
}

export class InputUpdatePostDataType {
  @IsStringWithTrim(1, postTitleConstraints.maxLength)
  public title: string;
  @IsStringWithTrim(1, postShortDescriptionConstraints.maxLength)
  public shortDescription: string;
  @IsStringWithTrim(1, postContentConstraints.maxLength)
  public content: string;
  @Validate(BlogExistsValidator)
  public blogId: string;
}

export class InputCreatePostToBlogDataType {
  @IsStringWithTrim(1, postContentConstraints.maxLength)
  public content: string;
  @IsStringWithTrim(1, postShortDescriptionConstraints.maxLength)
  public shortDescription: string;
  @IsStringWithTrim(1, postTitleConstraints.maxLength)
  public title: string;
}
