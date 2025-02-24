import { IsStringWithTrim } from '../../../../../../core/decorators/validation/is-string-with-trim.decorator';
import { commentContentConstraints } from '../../../constants/validation-constants';

export class InputCreateCommentDataType {
  @IsStringWithTrim(
    commentContentConstraints.minLength,
    commentContentConstraints.maxLength,
  )
  public content: string;
}

export class InputUpdateCommentDataType {
  @IsStringWithTrim(
    commentContentConstraints.minLength,
    commentContentConstraints.maxLength,
  )
  public content: string;
}
