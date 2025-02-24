import { Matches } from 'class-validator';
import { IsStringWithTrim } from '../../../../../../core/decorators/validation/is-string-with-trim.decorator';
import {
  blogNameConstraints,
  blogDescriptionConstraints,
  blogWebsiteUrlConstraints,
} from '../../../constants/validation-constants';

export class InputCreateBlogDataType {
  @IsStringWithTrim(1, blogNameConstraints.maxLength)
  public name: string;
  @IsStringWithTrim(1, blogDescriptionConstraints.maxLength)
  public description: string;
  @Matches(blogWebsiteUrlConstraints.match)
  @IsStringWithTrim(1, blogWebsiteUrlConstraints.maxLength)
  public websiteUrl: string;
}

export class InputUpdateBlogDataType {
  @IsStringWithTrim(1, blogNameConstraints.maxLength)
  public name: string;
  @IsStringWithTrim(1, blogDescriptionConstraints.maxLength)
  public description: string;
  @Matches(blogWebsiteUrlConstraints.match)
  @IsStringWithTrim(1, blogWebsiteUrlConstraints.maxLength)
  public websiteUrl: string;
}
