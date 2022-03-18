import React, { Fragment } from 'react';
import './Layout.css';

const Layout = ({ children, type }) => {
  const layoutClassName = type ? `layout-${type} ` : '';

  return (
    <Fragment>
      {React.Children.map(children, child => {
        const { className: childClassName = '' } = child.props;
        const className = `${layoutClassName}${childClassName}`;

        return React.cloneElement(child, { className });
      })}
    </Fragment>
  );
};

export default Layout;