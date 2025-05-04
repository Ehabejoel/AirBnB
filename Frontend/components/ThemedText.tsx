import { Text, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'defaultSemiBold' | 'title' | 'link';
  children: React.ReactNode;
}

export const ThemedText = ({ type = 'default', style, children, ...props }: ThemedTextProps) => {
  const baseStyles = 'text-black dark:text-white';
  let variantStyles = '';

  switch (type) {
    case 'title':
      variantStyles = 'text-2xl font-bold';
      break;
    case 'defaultSemiBold':
      variantStyles = 'font-semibold';
      break;
    case 'link':
      variantStyles = 'text-blue-500 underline';
      break;
    default:
      variantStyles = 'text-base';
  }

  return (
    <Text className={`${baseStyles} ${variantStyles}`} style={style} {...props}>
      {children}
    </Text>
  );
};