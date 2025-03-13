import { body } from 'express-validator';

/**
 * Validation rules for creating a governance proposal
 */
export const validateProposalCreate = [
  body('title')
    .notEmpty().withMessage('标题不能为空')
    .isString().withMessage('标题必须是字符串')
    .isLength({ min: 5, max: 100 }).withMessage('标题长度必须在5-100个字符之间'),
  
  body('description')
    .notEmpty().withMessage('描述不能为空')
    .isString().withMessage('描述必须是字符串')
    .isLength({ min: 20 }).withMessage('描述至少需要20个字符'),
  
  body('options')
    .isArray({ min: 2 }).withMessage('至少需要2个选项')
    .custom((options) => {
      if (!Array.isArray(options)) return false;
      
      // 检查每个选项是否为非空字符串
      const validOptions = options.every(
        option => typeof option === 'string' && option.trim().length > 0
      );
      
      // 检查选项是否有重复
      const uniqueOptions = new Set(options).size === options.length;
      
      return validOptions && uniqueOptions;
    }).withMessage('选项必须是唯一的非空字符串'),
  
  body('endDate')
    .notEmpty().withMessage('结束日期不能为空')
    .isISO8601().withMessage('结束日期必须是有效的ISO日期格式')
    .custom((value) => {
      const endDate = new Date(value);
      const now = new Date();
      
      // 结束日期必须至少比当前时间晚24小时
      const minEndDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      return endDate >= minEndDate;
    }).withMessage('结束日期必须至少比当前时间晚24小时')
];

/**
 * Validation rules for voting on a proposal
 */
export const validateProposalVote = [
  body('optionId')
    .notEmpty().withMessage('选项ID不能为空')
    .isUUID().withMessage('选项ID必须是有效的UUID格式')
];

export default {
  validateProposalCreate,
  validateProposalVote
}; 